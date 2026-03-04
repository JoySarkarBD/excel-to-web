// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { createPayment, getPaymentById, stripePaymentWebHook } from './payment.controller';

//Import validation from corresponding module
import config from '../../config/config';
import { validateId } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { validateCreatePayment } from './payment.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/payment
 * @description Create a new payment
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) ([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER])
 * @param {function} validation - ['validateCreatePayment']
 * @param {function} controller - ['createPayment']
 */
router.post(
  '',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  validateCreatePayment,
  createPayment
);

/**
 * @route POST /api/v1/payment/webhook
 * @description Handle Stripe payment webhook events
 * @access Public (Stripe will call this endpoint)
 * @param {function} controller - ['stripePaymentWebHook']
 */
router.post('/webhook', stripePaymentWebHook);

/**
 * @route GET /api/v1/payment/config
 * @description Get Stripe configuration (e.g., publishable key)
 * @access Public
 * @param {function} controller - ['getStripeConfig']
 */
router.get('/config', (req, res) => {
  res.json({
    publishableKey: config.STRIPE_PUBLISHER_KEY,
  });
});

/**
 * @route GET /api/v1/payment/:id
 * @description Get a payment by ID
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {IdOrIdsInput['id']} id - The ID of the payment to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPaymentById']
 */
router.get('/:id', validateId, getPaymentById);

//TODO: need to add route for getting all payments for a user and for transport manager to get all payments for their transport jobs
//TODO: need to add route for the SUPER_ADMIN to get all payments in the system with pagination and filtering options

// Export the router
module.exports = router;
