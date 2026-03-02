import { Request } from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import config from '../../config/config';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import {
  DiscountType,
  SubscriptionCoupon,
  SubscriptionHistory,
  SubscriptionInvoice,
  SubscriptionInvoiceStatus,
  SubscriptionPayment,
  SubscriptionPaymentMethod,
  SubscriptionStatus,
  UserSubscription,
} from '../../models';
import SendEmail from '../../utils/email/send-email';
import { subscriptionCouponServices } from '../subscription-coupon/subscription-coupon.service';
import { subscriptionPricingServices } from '../subscription-pricing/subscription-pricing.service';
import { getSubscriptionRemainingDays } from '../subscription-remain/subscription-remain.service';
import { CreatePaymentInput } from './payment.validation';

export const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover',
});

/**
 * Service function to create a new payment.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing user information.
 * @param {CreatePaymentInput} data - The data to create a new payment.
 * @returns {Promise<Partial<any>>} - The created payment.
 */
const createPayment = async (
  req: AuthenticatedRequest,
  data: CreatePaymentInput
): Promise<Partial<any>> => {
  // Check the user last subscription plan from the database and calculate remaining days
  const userSubscription = await getSubscriptionRemainingDays(req.user!._id);

  // If the user has an active subscription or trial, don't allow to purchase any more plan until the existing plan expires
  if (userSubscription.endDate && userSubscription.endDate > new Date()) {
    throw new Error(
      'You already have an active subscription. Please wait until the current subscription expires before purchasing a new one.'
    );
  }

  // If the subscription is lifetime, don't allow to purchase any more plan until the existing plan expires
  if (userSubscription?.isLifetime) {
    throw new Error('You have a lifetime subscription and cannot purchase another plan.');
  }

  const couponExist = await subscriptionCouponServices.getSubscriptionCouponByCode(
    data.coupon || ''
  );

  if (data.coupon && !couponExist) {
    throw new Error('Invalid coupon code');
  }

  if (couponExist && !couponExist.isActive) {
    throw new Error('This coupon code is not valid anymore');
  }

  // Validate the coupon for the pricing and user eligibility if coupon code is provided
  if (couponExist) {
    const isValidForPricing = couponExist.subscriptionPricings?.some(
      (pricingId) => pricingId.toString() === data.subscriptionPricingId
    );
    if (!isValidForPricing) {
      throw new Error('This coupon code is not valid for the selected subscription pricing');
    }
    const isUserEligible = couponExist.users?.some(
      (userId) => userId.toString() === req.user!._id.toString()
    );
    if (!isUserEligible) {
      throw new Error('You are not eligible to use this coupon code');
    }
  }

  // Check if the coupon is used by the user before if the coupon code is provided
  if (couponExist) {
    const hasUsedCoupon = couponExist.usedBy?.some(
      (userId) => userId.toString() === req.user!._id.toString()
    );

    if (hasUsedCoupon) {
      throw new Error('You have already used this coupon code before');
    }
  }

  const subscriptionPricingId = data.subscriptionPricingId;

  const subscriptionExist =
    await subscriptionPricingServices.getSubscriptionPricingById(subscriptionPricingId);

  if (!subscriptionExist) {
    throw new Error('Subscription pricing not found');
  }

  if (!subscriptionExist.isActive) {
    throw new Error('This subscription plan is not active currently');
  }

  if (subscriptionExist.price === undefined || subscriptionExist.price === null) {
    throw new Error('Subscription price is not available');
  }

  // Calculate the discounted price if a valid coupon is applied
  if (
    couponExist &&
    couponExist.discountValue !== undefined &&
    couponExist.discountValue !== null
  ) {
    if (couponExist.discountType === DiscountType.PERCENTAGE) {
      subscriptionExist.price = subscriptionExist.price * (1 - couponExist.discountValue / 100);
    } else if (couponExist.discountType === DiscountType.FIXED) {
      subscriptionExist.price = Math.max(0, subscriptionExist.price - couponExist.discountValue);
    }
  }

  // Create Stripe Checkout Session for the new payment
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'GBP',
          product_data: {
            name: `Plan ${subscriptionExist.subscriptionPlanName} Subscription`,
          },
          unit_amount: Math.round(subscriptionExist.price * 100), // Convert price to pence
        },
        quantity: 1,
      },
    ],
    success_url: `${config.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.CLIENT_URL}/cancel`,
    customer_email: req.user!.email,
    metadata: {
      userId: req.user!._id,
      userEmail: req.user!.email,
      planDetails: JSON.stringify({
        subscriptionPlanId: subscriptionExist._id,
        subscriptionPlanName: subscriptionExist.subscriptionPlanName,
        subscriptionDuration: subscriptionExist.subscriptionDuration,
      }),
      couponId: couponExist?._id?.toString() || null,
      couponCode: data.coupon || null,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    cancel: session.cancel_url,
  };
};

/**
 * Service function to handle Stripe payment webhook events.
 *
 * @param {Request} req - The request object containing the webhook event data.
 * @returns {Promise<{ received: boolean }>} - An object indicating that the webhook event was received successfully.
 * @throws {Error} - Throws an error if the webhook event processing fails.
 */
const stripePaymentWebHook = async (req: Request) => {
  // Stripe sends the webhook event data as raw bytes, so we need to construct the event using the raw body and signature
  const signature = req.headers['stripe-signature'];
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET || 'whsec_xxxxx';

  // Validate the presence of the Stripe signature header
  if (!signature || Array.isArray(signature)) {
    throw new Error('Missing or invalid Stripe signature header');
  }

  // Construct the Stripe event using the raw body and signature to ensure the webhook is secure and valid
  let event: Stripe.Event;

  // Use the Stripe library's webhook construction method to validate the event and extract the event data

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    if (event.type === 'checkout.session.completed') {
      const stripeSession = event.data.object as Stripe.Checkout.Session;

      if (!stripeSession.metadata) {
        throw new Error('Session metadata is missing');
      }

      const planDetails = JSON.parse(stripeSession.metadata.planDetails || '{}');

      const generateInvoiceNumber = () => {
        const timestamp = Date.now().toString();
        const randomSuffix = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
        return `INV-${timestamp}-${randomSuffix}`;
      };

      // Start a MongoDB transaction to ensure ACID for all related writes
      const dbSession = await mongoose.startSession();
      try {
        dbSession.startTransaction();

        const [userSubscriptionData] = await UserSubscription.create(
          [
            {
              userId: new mongoose.Types.ObjectId(stripeSession.metadata.userId),
              subscriptionPlanId: new mongoose.Types.ObjectId(planDetails.subscriptionPlanId),
              subscriptionDurationId: new mongoose.Types.ObjectId(
                planDetails.subscriptionDurationId
              ),
              subscriptionPricingId: new mongoose.Types.ObjectId(planDetails.subscriptionPricingId),
              status: SubscriptionStatus.ACTIVE,
              startDate: new Date(),
              endDate: new Date(
                Date.now() + planDetails.subscriptionDuration * 24 * 60 * 60 * 1000
              ),
            },
          ],
          { session: dbSession }
        );

        const [invoice] = await SubscriptionInvoice.create(
          [
            {
              userId: new mongoose.Types.ObjectId(stripeSession.metadata.userId),
              userSubscriptionId: userSubscriptionData._id,
              invoiceNumber: generateInvoiceNumber(),
              amount: stripeSession.amount_total ? stripeSession.amount_total / 100 : undefined,
              status:
                stripeSession.payment_status === 'paid'
                  ? SubscriptionInvoiceStatus.PAID
                  : SubscriptionInvoiceStatus.FAILED,
              stripeInvoiceId: stripeSession.invoice ? stripeSession.invoice.toString() : undefined,
              couponId: stripeSession.metadata.couponId
                ? new mongoose.Types.ObjectId(stripeSession.metadata.couponId)
                : undefined,
            },
          ],
          { session: dbSession }
        );

        const [subscriptionHistoryLog] = await SubscriptionHistory.create(
          [
            {
              userId: new mongoose.Types.ObjectId(stripeSession.metadata.userId),
              subscriptionPlanId: new mongoose.Types.ObjectId(planDetails.subscriptionPlanId),
              subscriptionDurationId: new mongoose.Types.ObjectId(
                planDetails.subscriptionDurationId
              ),
              startDate: new Date(),
              endDate: new Date(
                Date.now() + planDetails.subscriptionDuration * 24 * 60 * 60 * 1000
              ),
            },
          ],
          { session: dbSession }
        );

        const [subscriptionPaymentLog] = await SubscriptionPayment.create(
          [
            {
              subscriptionInvoiceId: new mongoose.Types.ObjectId(invoice._id),
              transactionId: stripeSession.payment_intent
                ? stripeSession.payment_intent.toString()
                : undefined,
              paidAmount: stripeSession.amount_total ? stripeSession.amount_total / 100 : undefined,
              paymentStatus:
                stripeSession.payment_status === 'paid'
                  ? SubscriptionInvoiceStatus.PAID
                  : SubscriptionInvoiceStatus.FAILED,
              paidAt: new Date(),
              paymentMethod: SubscriptionPaymentMethod.CARD,
            },
          ],
          { session: dbSession }
        );

        if (stripeSession.metadata.couponId) {
          await SubscriptionCoupon.findByIdAndUpdate(
            stripeSession.metadata.couponId,
            { $addToSet: { usedBy: new mongoose.Types.ObjectId(stripeSession.metadata.userId) } },
            { session: dbSession }
          );
        }

        // Commit transaction before sending external notifications
        await dbSession.commitTransaction();
        dbSession.endSession();

        console.log('Payment successful for session:', stripeSession.id);
        console.log('User subscription created:', userSubscriptionData);
        console.log('Invoice log -', invoice);
        console.log('Subscription history log -', subscriptionHistoryLog);
        console.log('Subscription payment log -', subscriptionPaymentLog);

        await SendEmail({
          to: stripeSession.customer_email!,
          subject: 'Subscription Purchase Confirmation',
          text: `Thank you for your purchase! Your subscription to the ${planDetails.subscriptionPlanName} plan has been activated. Invoice Number: ${invoice.invoiceNumber}`,
          html: `<p>Thank you for your purchase! Your subscription to the <strong>${planDetails.subscriptionPlanName}</strong> plan has been activated.</p><p>Invoice Number: <strong>${invoice.invoiceNumber}</strong></p>`,
        });
      } catch (innerErr) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        throw innerErr;
      }
    }
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent was successful:', paymentIntent.id);
    }
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    throw new Error(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return { received: true };
};

/**
 * Service function to retrieve a single payment by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the payment to retrieve.
 * @returns {Promise<Partial<any>>} - The retrieved payment.
 */
const getPaymentById = async (id: IdOrIdsInput['id']): Promise<Partial<any> | null> => {
  return null;
};

export const paymentServices = {
  createPayment,
  stripePaymentWebHook,
  getPaymentById,
};
