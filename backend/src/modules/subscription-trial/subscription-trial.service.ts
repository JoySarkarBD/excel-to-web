// Import the model
import mongoose from 'mongoose';

import config from '../../config/config';
import { IUserSubscription, SubscriptionStatus, UserSubscription } from '../../models';

/**
 * Service function to create a new subscription-trial.
 *
 * @param {CreateSubscriptionTrialInput} data - The data to create a new subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>>} - The created subscription-trial.
 */
const createSubscriptionTrial = async (
  data: Partial<IUserSubscription> & { userId: string }
): Promise<Partial<IUserSubscription>> => {
  // Set trial start and end dates
  const newDate = new Date();
  // Set time for consistency
  const endDate = new Date(newDate);
  // Set time to end of the day
  endDate.setDate(endDate.getDate() + config.SUBSCRIPTION_TRIAL_DAYS); // Add trial days from config
  data = {
    ...data,
    startDate: newDate,
    endDate: endDate,
    status: SubscriptionStatus.TRIAL, // Set status to TRIAL
  };
  // Check for existing active trial for the user and subscription
  const existingSubscriptionTrial = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(data.userId),
    status: SubscriptionStatus.TRIAL,
  }).lean();
  // Only allow one active trial per user. If an active trial already exists, throw an error
  if (existingSubscriptionTrial) {
    throw new Error(
      'A subscription already exists for this user. Cannot create a trial subscription'
    );
  }
  // Proceed to create the subscription-trial
  const newSubscriptionTrial = new UserSubscription(data);
  // Save to database
  const savedSubscriptionTrial = await newSubscriptionTrial.save();
  return savedSubscriptionTrial;
};

export const subscriptionTrialServices = {
  createSubscriptionTrial,
};
