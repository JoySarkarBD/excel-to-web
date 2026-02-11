import { NextFunction, Request, Response } from 'express';
import ServerResponse from '../helpers/responses/custom-response';
import { getSubscriptionRemainingDays } from '../modules/subscription-remain/subscription-remain.service';
import { AuthenticatedRequest } from './is-authorized';

/**
 * Middleware to check if the authenticated user has an active subscription or trial before allowing access to protected routes.
 * This middleware should be used after the isAuthorized middleware to ensure the user is authenticated.
 * @param req - The request object, which should include the authenticated user's details.
 * @param res - The response object used to send responses back to the client.
 * @param next - The next middleware function in the stack.
 */
const checkSubscriptionValidity = async (req: Request, res: Response, next: NextFunction) => {
  // Get the user details from the request object
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;
  // If user details are not found on the request, return an unauthorized response
  if (!user?._id) {
    return res.status(401).json({ message: 'Unauthorized. User not found on request.' });
  }
  // Validate user ID format
  try {
    // Check the user last subscription plan from the database and calculate remaining days
    const userSubscription = await getSubscriptionRemainingDays(user._id);
    // If no active subscription or trial found, return a forbidden response
    if (!userSubscription) {
      return ServerResponse(
        res,
        false,
        403,
        'Access denied. No active subscription or trial found.'
      );
    }
    const currentDate = new Date();
    console.log('Current date:', currentDate);
    console.log('User subscription end date:', userSubscription.endDate);
    console.log(
      'Subscription days remain:',
      userSubscription.endDate
        ? Math.ceil(
            (userSubscription.endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 'N/A'
    );
    // If the subscription is lifetime, allow access directly
    if (userSubscription.isLifetime) {
      next();
    }
    // Check if the subscription or trial has expired based on endDate
    if (userSubscription.endDate && userSubscription.endDate < currentDate) {
      return ServerResponse(res, false, 403, 'Access denied. Subscription or trial has expired.');
    }
    // If the subscription is valid, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return ServerResponse(res, false, 500, 'Internal server error');
  }
};

export default checkSubscriptionValidity;
