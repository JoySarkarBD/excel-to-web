import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../helpers/responses/custom-response';
import { getSubscriptionRemainingDays } from '../modules/subscription-remain/subscription-remain.service';
import { AuthenticatedRequest } from './is-authorized';
import { UserRole } from '../models/users-accounts/user.schema';
import ClientManagement, { ClientStatus } from '../models/users-accounts/clientManagement.schema';

/**
 * Middleware to check if the user (or their connected Transport Manager, if they are a STANDALONE_USER) has an active subscription or trial.
 * - If the user is a STANDALONE_USER, it first checks if they are connected to any Transport Manager with an approved connection. If so, it checks the subscription of that manager instead.
 * - If the user (or their manager) has a lifetime subscription, access is granted.
 * - If the subscription is expired, access is denied with a 403 response.
 * - If there is any error during the process, a 500 response is returned.
 */
const checkSubscriptionValidity = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;

  if (!user?._id) {
    return res.status(401).json({ message: 'Unauthorized. User not found on request.' });
  }

  try {
    let subscriptionUserId = user._id; // Default: check own subscription

    // If user is STANDALONE_USER, check if connected with any Transport Manager
    if (user.role === UserRole.STANDALONE_USER) {
      const clientConnection = await ClientManagement.findOne({
        'clients.clientId': new mongoose.Types.ObjectId(user._id),
        'clients.status': { $in: [ClientStatus.APPROVED] },
      }).select('managerId');

      // If connected → check manager subscription instead
      if (clientConnection?.managerId) {
        subscriptionUserId = clientConnection.managerId.toString();
      }
    }

    // Get subscription info (either own or manager’s)
    const userSubscription = await getSubscriptionRemainingDays(subscriptionUserId);

    if (!userSubscription) {
      return ServerResponse(
        res,
        false,
        403,
        'Access denied. No active subscription or trial found.'
      );
    }

    const currentDate = new Date();

    // Lifetime subscription → allow
    if (userSubscription.isLifetime) {
      return next();
    }

    // Expired subscription
    if (userSubscription.endDate && userSubscription.endDate < currentDate) {
      return ServerResponse(res, false, 403, 'Access denied. Subscription or trial has expired.');
    }

    // Valid subscription
    return next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return ServerResponse(res, false, 500, 'Internal server error');
  }
};

export default checkSubscriptionValidity;
