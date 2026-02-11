import mongoose from 'mongoose';
import { SubscriptionStatus, UserSubscription } from '../../models';

/**
 * Get remaining subscription days for a user.
 * @param userId string - Mongo user id
 * @returns { daysRemaining: number; expired: boolean; isLifetime: boolean; startDate: Date | undefined; endDate: Date | undefined; subscriptionId: string | undefined  }
 */
export const getSubscriptionRemainingDays = async (userId: string) => {
  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');
  // Find active subscription for the user
  const subscription = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
  })
    .lean()
    .sort({ createdAt: -1 }) // most recent first
    .exec();
  // No active subscription at all
  if (!subscription) {
    return {
      daysRemaining: 0,
      expired: true,
      isLifetime: false,
      startDate: undefined,
      endDate: undefined,
      subscriptionId: undefined,
    };
  }
  // Calculate remaining days
  const now = new Date();
  // Lifetime subscription
  if (!subscription.endDate) {
    return {
      daysRemaining: Infinity,
      expired: false,
      isLifetime: true,
      startDate: subscription.startDate,
      endDate: undefined,
      subscriptionId: subscription._id.toString(),
    };
  }
  // Subscription with end date
  const diffMs = subscription.endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const expired = diffMs <= 0;
  return {
    daysRemaining,
    expired,
    isLifetime: false,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    subscriptionId: subscription._id.toString(),
  };
};
