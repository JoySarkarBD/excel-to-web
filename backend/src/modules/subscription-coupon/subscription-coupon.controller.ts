import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { subscriptionCouponServices } from './subscription-coupon.service';

/**
 * Controller function to handle the creation of a single subscription-coupon.
 *
 * @param {Request} req - The request object containing subscription-coupon data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The created subscription-coupon.
 * @throws {Error} - Throws an error if the subscription-coupon creation fails.
 */
export const createSubscriptionCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the authenticated user's ID as the creator
    const userId = req.user!._id;
    // Request body assignment for createdBy field
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new subscription-coupon and get the result
    const result = await subscriptionCouponServices.createSubscriptionCoupon(req.body);
    if (!result) throw new Error('Failed to create subscription-coupon');
    // Send a success response with the created subscription-coupon data
    ServerResponse(res, true, 201, 'Subscription-coupon created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single subscription-coupon.
 *
 * @param {Request} req - The request object containing the ID of the subscription-coupon to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The updated subscription-coupon.
 * @throws {Error} - Throws an error if the subscription-coupon update fails.
 */
export const updateSubscriptionCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subscription-coupon by ID and get the result
  const result = await subscriptionCouponServices.updateSubscriptionCoupon(id as string, req.body);
  if (!result) throw new Error('Failed to update subscription-coupon');
  // Send a success response with the updated subscription-coupon data
  ServerResponse(res, true, 200, 'Subscription-coupon updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subscription-coupon.
 *
 * @param {Request} req - The request object containing the ID of the subscription-coupon to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The deleted subscription-coupon.
 * @throws {Error} - Throws an error if the subscription-coupon deletion fails.
 */
export const deleteSubscriptionCoupon = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subscription-coupon by ID
  const result = await subscriptionCouponServices.deleteSubscriptionCoupon(id as string);
  if (!result) throw new Error('Failed to delete subscription-coupon');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subscription-coupon deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subscription-coupon by ID.
 *
 * @param {Request} req - The request object containing the ID of the subscription-coupon to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The retrieved subscription-coupon.
 * @throws {Error} - Throws an error if the subscription-coupon retrieval fails.
 */
export const getSubscriptionCouponById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subscription-coupon by ID and get the result
  const result = await subscriptionCouponServices.getSubscriptionCouponById(id as string);
  if (!result) throw new Error('Subscription-coupon not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Subscription-coupon retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subscription-coupons.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubscriptionCoupon>[]>} - The retrieved subscription-coupons.
 * @throws {Error} - Throws an error if the subscription-coupons retrieval fails.
 */
export const getManySubscriptionCoupon = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple subscription-coupons based on query parameters and get the result
  const { subscriptionCoupons, totalData, totalPages } =
    await subscriptionCouponServices.getManySubscriptionCoupon(query);
  if (!subscriptionCoupons) throw new Error('Failed to retrieve subscription-coupons');
  // Send a success response with the retrieved subscription-coupons data
  ServerResponse(res, true, 200, 'Subscription-coupons retrieved successfully', {
    subscriptionCoupons,
    totalData,
    totalPages,
  });
});
