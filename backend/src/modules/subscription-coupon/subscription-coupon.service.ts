// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { ISubscriptionCoupon, SubscriptionCoupon, SubscriptionPricing, User } from '../../models';
import {
  CreateSubscriptionCouponInput,
  UpdateSubscriptionCouponInput,
} from './subscription-coupon.validation';

/**
 * Service function to create a new subscription-coupon.
 *
 * @param {CreateSubscriptionCouponInput} data - The data to create a new subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The created subscription-coupon.
 */
const createSubscriptionCoupon = async (
  data: CreateSubscriptionCouponInput
): Promise<Partial<ISubscriptionCoupon>> => {
  // Destructure the relevant fields from the input data
  const { code, users } = data;
  const normalizedCode = code.toUpperCase().trim();
  // Check for duplicate code
  const existingSubscriptionCoupon = await SubscriptionCoupon.findOne({
    code: normalizedCode,
  }).lean();
  // Check for duplicate code and prevent creation if a duplicate exists
  if (existingSubscriptionCoupon) {
    throw new Error('Duplicate detected: A subscription-coupon with the same code already exists.');
  }
  // Validate user IDs if provided
  const userIds = users?.map((u) => new mongoose.Types.ObjectId(u));
  // Validate user IDs if provided
  const userExistenceChecks = await User.find({ _id: { $in: userIds } })
    .select('_id')
    .lean();
  // Extract existing user IDs from the database results
  const existingUserIds = userExistenceChecks.map((u) => u._id.toString());
  // Identify any non-existing user IDs from the input
  const nonExistingUserIds = userIds?.filter((u) => !existingUserIds.includes(u.toString()));
  // If there are any non-existing user IDs, throw an error with details
  if (nonExistingUserIds && nonExistingUserIds.length > 0) {
    throw new Error(
      `Validation error: The following user IDs do not exist: ${nonExistingUserIds.join(', ')}`
    );
  }
  // Validate subscription pricing IDs if provided
  const subscriptionPricingIds = data.subscriptionPricings?.map(
    (sp) => new mongoose.Types.ObjectId(sp)
  );
  const subscriptionPricingExistenceChecks = await SubscriptionPricing.find({
    _id: { $in: subscriptionPricingIds },
  })
    .select('_id')
    .lean();
  // Extract existing subscription pricing IDs from the database results
  const existingSubscriptionPricingIds = subscriptionPricingExistenceChecks.map((sp) =>
    sp._id.toString()
  );
  // Identify any non-existing subscription pricing IDs from the input
  const nonExistingSubscriptionPricingIds = subscriptionPricingIds?.filter(
    (sp) => !existingSubscriptionPricingIds.includes(sp.toString())
  );
  // If there are any non-existing subscription pricing IDs, throw an error with details
  if (nonExistingSubscriptionPricingIds && nonExistingSubscriptionPricingIds.length > 0) {
    throw new Error(
      `Validation error: The following subscription pricing IDs do not exist: ${nonExistingSubscriptionPricingIds.join(', ')}`
    );
  }
  // Proceed to create the new subscription-coupon
  const newSubscriptionCoupon = new SubscriptionCoupon(data);
  const savedSubscriptionCoupon = await newSubscriptionCoupon.save();
  return savedSubscriptionCoupon;
};

/**
 * Service function to update a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to update.
 * @param {UpdateSubscriptionCouponInput} data - The updated data for the subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The updated subscription-coupon.
 */
const updateSubscriptionCoupon = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionCouponInput
): Promise<Partial<ISubscriptionCoupon | null>> => {
  // Check for duplicate code if the code is being updated
  const existingSubscriptionCoupon = await SubscriptionCoupon.findOne({
    _id: { $ne: id }, // Exclude the current document
    code: data.code ? data.code.toUpperCase().trim() : undefined, // Check for duplicate code if it's being updated
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionCoupon) {
    throw new Error(
      'Duplicate detected: Another subscription-coupon with the same code already exists.'
    );
  }
  // Validate user IDs if provided
  const userIds = data.users?.map((u) => new mongoose.Types.ObjectId(u));
  const userExistenceChecks = await User.find({ _id: { $in: userIds } })
    .select('_id')
    .lean();
  const existingUserIds = userExistenceChecks.map((u) => u._id.toString());
  const nonExistingUserIds = userIds?.filter((u) => !existingUserIds.includes(u.toString()));
  if (nonExistingUserIds && nonExistingUserIds.length > 0) {
    throw new Error(
      `Validation error: The following user IDs do not exist: ${nonExistingUserIds.join(', ')}`
    );
  }
  // Validate subscription pricing IDs if provided
  const subscriptionPricingIds = data.subscriptionPricings?.map(
    (sp) => new mongoose.Types.ObjectId(sp)
  );
  // Check existence of subscription pricing IDs and identify any non-existing IDs
  const subscriptionPricingExistenceChecks = await SubscriptionPricing.find({
    _id: { $in: subscriptionPricingIds },
  })
    .select('_id')
    .lean();
  // Extract existing subscription pricing IDs from the database results
  const existingSubscriptionPricingIds = subscriptionPricingExistenceChecks.map((sp) =>
    sp._id.toString()
  );
  // Identify any non-existing subscription pricing IDs from the input
  const nonExistingSubscriptionPricingIds = subscriptionPricingIds?.filter(
    (sp) => !existingSubscriptionPricingIds.includes(sp.toString())
  );
  // If there are any non-existing subscription pricing IDs, throw an error with details
  if (nonExistingSubscriptionPricingIds && nonExistingSubscriptionPricingIds.length > 0) {
    throw new Error(
      `Validation error: The following subscription pricing IDs do not exist: ${nonExistingSubscriptionPricingIds.join(', ')}`
    );
  }
  // Proceed to update the subscription-coupon
  const updatedSubscriptionCoupon = await SubscriptionCoupon.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionCoupon;
};

/**
 * Service function to delete a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to delete.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The deleted subscription-coupon.
 */
const deleteSubscriptionCoupon = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionCoupon | null>> => {
  const deletedSubscriptionCoupon = await SubscriptionCoupon.findByIdAndDelete(id);
  return deletedSubscriptionCoupon;
};

/**
 * Service function to retrieve a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to retrieve.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The retrieved subscription-coupon.
 */
const getSubscriptionCouponById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionCoupon | null>> => {
  const subscriptionCoupon = await SubscriptionCoupon.findById(id);
  return subscriptionCoupon;
};

/**
 * Service function to retrieve multiple subscription-coupon based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>[]>} - The retrieved subscription-coupon
 */
const getManySubscriptionCoupon = async (
  query: SearchQueryInput
): Promise<{
  subscriptionCoupons: Partial<ISubscriptionCoupon>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [{ code: { $regex: searchKey, $options: 'i' } }],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-coupon
  const totalData = await SubscriptionCoupon.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-coupons based on the search filter with pagination
  const subscriptionCoupons = await SubscriptionCoupon.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionCoupons, totalData, totalPages };
};

export const subscriptionCouponServices = {
  createSubscriptionCoupon,
  updateSubscriptionCoupon,
  deleteSubscriptionCoupon,
  getSubscriptionCouponById,
  getManySubscriptionCoupon,
};
