// Import the model

import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  ISubscriptionPricing,
  SubscriptionDuration,
  SubscriptionPlan,
  SubscriptionPricing,
  UserRole,
} from '../../models';
import {
  CreateSubscriptionPricingInput,
  UpdateSubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Service function to create a new subscription-pricing.
 *
 * @param {CreateSubscriptionPricingInput} data - The data to create a new subscription-pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscription-pricing.
 */
const createSubscriptionPricing = async (
  data: CreateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing>> => {
  // Extract subscription plan and duration IDs from validated data
  const { subscriptionPlanId, subscriptionDurationId } = data;
  // Check if the subscription plan exists
  const isSubscriptionPlanAvailable = await SubscriptionPlan.findOne({
    _id: subscriptionPlanId,
  });
  // Check if the subscription duration exists
  const isSubscriptionDurationAvailable = await SubscriptionDuration.findOne({
    _id: subscriptionDurationId,
  });
  // Throw error if subscription plan is not found
  if (!isSubscriptionPlanAvailable) {
    throw new Error('Subscription-plan not found');
  }
  // Throw error if subscription duration is not found
  if (!isSubscriptionDurationAvailable) {
    throw new Error('Subscription-duration not found');
  }
  // Check if a pricing entry already exists for the given subscription plan and duration
  const isExistingPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId,
    subscriptionDurationId,
  });
  if (isExistingPricing) {
    throw new Error('Subscription-pricing already exists for the selected plan and duration');
  }
  const newSubscriptionPricing = new SubscriptionPricing(data);
  const savedSubscriptionPricing = await newSubscriptionPricing.save();
  return savedSubscriptionPricing;
};

/**
 * Service function to update a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The updated data for the subscription-pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscription-pricing.
 */
const updateSubscriptionPricing = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId: data.subscriptionPlanId,
    subscriptionDurationId: data.subscriptionDurationId,
  });
  // Prevent duplicate updates
  if (existingSubscriptionPricing) {
    throw new Error(
      'Duplicate detected: Another subscription-pricing with the same fieldName already exists.'
    );
  }
  // ! If this subscription-pricing is already in userSubscription, prevent updating core fields (subscriptionPlanId, subscriptionDurationId) and allow only isActive field to be updated.

  // TODO: * First, check if this subscription-pricing exists in any userSubscription taken by any user
  // TODO: * If taken by any user, throw a thorough error: 'This subscription-pricing is already assigned to a user's subscription'
  // Proceed to update the subscription-pricing
  const updatedSubscriptionPricing = await SubscriptionPricing.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionPricing;
};

/**
 * Service function to delete a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscription-pricing.
 */
const deleteSubscriptionPricing = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPricing | null>> => {
  // TODO: * First, check if this subscription-pricing exists in any userSubscription taken by any user
  // TODO: * If taken by any user, throw a thorough error: 'This subscription-pricing is already assigned to a user's subscription'
  const deletedSubscriptionPricing = await SubscriptionPricing.findByIdAndDelete(id);
  return deletedSubscriptionPricing;
};

/**
 * Service function to delete multiple subscription-pricing(s).
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-pricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscription-pricing(s).
 */
const deleteManySubscriptionPricing = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPricing>[]> => {
  const subscriptionPricingToDelete = await SubscriptionPricing.find({ _id: { $in: ids } });
  if (!subscriptionPricingToDelete.length)
    throw new Error('No subscription-pricing found to delete');
  // TODO: * First, check if these subscription-pricing exist in any userSubscription taken by any user
  // TODO: * If taken by any user, throw a thorough error: 'These subscription-pricing are already assigned to a user's subscription'
  await SubscriptionPricing.deleteMany({ _id: { $in: ids } });
  return subscriptionPricingToDelete;
};

/**
 * Service function to retrieve a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve.
 * @param {UserRole} userRole - Optional user role to determine filtering (SUPER_ADMIN sees all, others see only active)
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscription-pricing.
 */
const getSubscriptionPricingById = async (
  id: string,
  userRole?: UserRole
): Promise<Partial<ISubscriptionPricing> | null> => {
  // Check if valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  const objectId = new mongoose.Types.ObjectId(id);
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build query - filter by isActive if not super admin
  const query: any = { _id: objectId };
  if (!isSuperAdmin) {
    query.isActive = true;
  }
  // Search by _id with optional isActive filter
  const subscriptionPricing = await SubscriptionPricing.findOne(query);
  return subscriptionPricing;
};

/**
 * Service function to retrieve multiple subscription-pricing based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-pricing.
 * @param {UserRole} userRole - Optional user role to determine filtering (SUPER_ADMIN sees all, others see only active)
 * @returns {Promise<Partial<ISubscriptionPricing & { subscriptionPlanName: string; subscriptionDuration: string }>[]>} - The retrieved subscription-pricing
 */
const getManySubscriptionPricing = async (query: SearchQueryInput, userRole?: UserRole) => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  const skipItems = (pageNo - 1) * showPerPage;
  // Convert searchKey to number if possible
  const numericSearch = !isNaN(Number(searchKey)) ? Number(searchKey) : null;
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build aggregation pipeline
  const aggregationPipeline: mongoose.PipelineStage[] = [
    // Filter by isActive status if not super admin
    ...(!isSuperAdmin ? [{ $match: { isActive: true } }] : []),
    // Lookup subscription plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Lookup subscription duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
    // Match search key across multiple fields
    {
      $match: {
        $or: [
          { currency: { $regex: searchKey, $options: 'i' } },
          { 'subscriptionPlan.name': { $regex: searchKey, $options: 'i' } },
          ...(numericSearch !== null ? [{ price: numericSearch }] : []),
          ...(numericSearch !== null
            ? [{ 'subscriptionDuration.durationInDays': numericSearch }]
            : []),
        ],
      },
    },
    // Sort by createdAt desc
    { $sort: { createdAt: -1 } },
    // Pagination
    { $skip: skipItems },
    { $limit: showPerPage },
    // Project final fields
    {
      $project: {
        _id: 1,
        subscriptionPlanName: '$subscriptionPlan.name',
        subscriptionPlanType: '$subscriptionPlan.planType',
        applicableAccountType: '$subscriptionPlan.applicableAccountType',
        subscriptionPlanDescription: '$subscriptionPlan.description',
        subscriptionPlanStatus: '$subscriptionPlan.isActive',
        subscriptionDurationStatus: '$subscriptionDuration.isActive',
        subscriptionName: '$subscriptionDuration.name',
        subscriptionDuration: '$subscriptionDuration.durationInDays',
        price: 1,
        currency: 1,
        isActive: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
  const subscriptionPricings = await SubscriptionPricing.aggregate(aggregationPipeline);
  // Total count
  const totalDataPipeline: mongoose.PipelineStage[] = [
    // Filter by isActive status if not super admin
    ...(!isSuperAdmin ? [{ $match: { isActive: true } }] : []),
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { currency: { $regex: searchKey, $options: 'i' } },
          { 'subscriptionPlan.name': { $regex: searchKey, $options: 'i' } },
          ...(numericSearch !== null ? [{ price: numericSearch }] : []),
          ...(numericSearch !== null
            ? [{ 'subscriptionDuration.durationInDays': numericSearch }]
            : []),
        ],
      },
    },
    { $count: 'count' },
  ];

  const totalCountResult = await SubscriptionPricing.aggregate(totalDataPipeline);
  const totalData = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);
  return { subscriptionPricings, totalData, totalPages };
};

export const subscriptionPricingServices = {
  createSubscriptionPricing,
  updateSubscriptionPricing,
  deleteSubscriptionPricing,
  deleteManySubscriptionPricing,
  getSubscriptionPricingById,
  getManySubscriptionPricing,
};
