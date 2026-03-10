// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  IRenewalTracker,
  PolicyProcedure,
  RenewalTracker,
  RenewalTrackerStatus,
  UserRole,
} from '../../models';
import { CreateRenewalTrackerInput, UpdateRenewalTrackerInput } from './renewal-tracker.validation';
import { deriveRenewalTrackerStatus } from './renewal-tracker.status';

// Validate that the provided refOrPolicyNo and responsiblePerson (if any) are valid PolicyProcedure references
const validatePolicyProcedureRefs = async (data: {
  refOrPolicyNo?: string | mongoose.Types.ObjectId;
  responsiblePerson?: string | mongoose.Types.ObjectId;
}) => {
  const refIds = [data.refOrPolicyNo, data.responsiblePerson].filter(Boolean).map(String);
  if (refIds.length === 0) return;

  const uniqueIds = Array.from(new Set(refIds));
  const count = await PolicyProcedure.countDocuments({ _id: { $in: uniqueIds } });

  if (count !== uniqueIds.length) {
    throw new Error('refOrPolicyNo and responsiblePerson must be valid PolicyProcedure ids');
  }
};

// Check if the user has access to the document based on standAloneId or createdBy
const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

// Map populated PolicyProcedure references to simple display strings.
const mapPolicyProcedureRefs = (tracker: any) => {
  if (!tracker) return tracker;

  const refOrPolicyNoValue = tracker.refOrPolicyNo;
  const responsiblePersonValue = tracker.responsiblePerson;

  const refOrPolicyNoId =
    refOrPolicyNoValue && typeof refOrPolicyNoValue === 'object'
      ? String(refOrPolicyNoValue._id || '')
      : refOrPolicyNoValue
        ? String(refOrPolicyNoValue)
        : '';

  const responsiblePersonId =
    responsiblePersonValue && typeof responsiblePersonValue === 'object'
      ? String(responsiblePersonValue._id || '')
      : responsiblePersonValue
        ? String(responsiblePersonValue)
        : '';

  const refOrPolicyNoName =
    refOrPolicyNoValue && typeof refOrPolicyNoValue === 'object'
      ? refOrPolicyNoValue.policyName || ''
      : '';

  const responsiblePersonName =
    responsiblePersonValue && typeof responsiblePersonValue === 'object'
      ? responsiblePersonValue.responsiblePerson || ''
      : '';

  return {
    ...tracker,
    refOrPolicyNo: refOrPolicyNoId,
    responsiblePerson: responsiblePersonId,
    refOrPolicyNoName,
    responsiblePersonName,
  };
};

/**
 * Service function to create a new renewal-tracker.
 *
 * @param {CreateRenewalTrackerInput} data - The data to create a new renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>>} - The created renewal-tracker.
 */
const createRenewalTracker = async (
  data: CreateRenewalTrackerInput
): Promise<Partial<IRenewalTracker>> => {
  const payload: any = { ...data };

  // Keep responsiblePerson in sync with selected policy ref.
  if (payload.refOrPolicyNo) {
    payload.responsiblePerson = payload.refOrPolicyNo;
  }

  await validatePolicyProcedureRefs({
    refOrPolicyNo: payload.refOrPolicyNo,
    responsiblePerson: payload.responsiblePerson,
  });

  payload.status = deriveRenewalTrackerStatus({
    startDate: payload.startDate,
    expiryOrDueDate: payload.expiryOrDueDate,
    reminderSet: payload.reminderSet,
    reminderDate: payload.reminderDate,
  });

  const newRenewalTracker = new RenewalTracker(payload);
  const savedRenewalTracker = await newRenewalTracker.save();
  return savedRenewalTracker;
};

/**
 * Service function to update a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to update.
 * @param {UpdateRenewalTrackerInput} data - The updated data for the renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>>} - The updated renewal-tracker.
 */
const updateRenewalTracker = async (
  id: IdOrIdsInput['id'],
  data: UpdateRenewalTrackerInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<Partial<IRenewalTracker | null>> => {
  const existingRenewalTracker = await RenewalTracker.findById(id)
    .select('standAloneId createdBy')
    .lean();
  if (!existingRenewalTracker) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingRenewalTracker, accessOwnerId)) {
    return null;
  }

  const payload: any = { ...data };

  // Keep responsiblePerson in sync with selected policy ref.
  if (payload.refOrPolicyNo) {
    payload.responsiblePerson = payload.refOrPolicyNo;
  }

  await validatePolicyProcedureRefs({
    refOrPolicyNo: payload.refOrPolicyNo,
    responsiblePerson: payload.responsiblePerson,
  });

  const existingDates = await RenewalTracker.findById(id)
    .select('startDate expiryOrDueDate reminderSet reminderDate')
    .lean();

  const nextStartDate =
    data.startDate !== undefined ? data.startDate : (existingDates as any)?.startDate;
  const nextDueDate =
    data.expiryOrDueDate !== undefined
      ? data.expiryOrDueDate
      : (existingDates as any)?.expiryOrDueDate;
  const nextReminderSet =
    data.reminderSet !== undefined ? data.reminderSet : (existingDates as any)?.reminderSet;
  const nextReminderDate =
    data.reminderDate !== undefined ? data.reminderDate : (existingDates as any)?.reminderDate;

  payload.status = deriveRenewalTrackerStatus({
    startDate: nextStartDate,
    expiryOrDueDate: nextDueDate,
    reminderSet: nextReminderSet,
    reminderDate: nextReminderDate,
  });

  const updatedRenewalTracker = await RenewalTracker.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedRenewalTracker;
};

/**
 * Service function to synchronize the status of all renewal-trackers based on their dates and reminder settings.
 *
 * @returns {Promise<number>} - The number of renewal-trackers that were updated.
 * This function iterates through all renewal-trackers, derives their next status using the deriveRenewalTrackerStatus function, and updates the status in the database if it has changed. It returns the count of renewal-trackers that were updated.
 * This function can be scheduled to run periodically (e.g., daily) to ensure that the statuses of renewal-trackers are always up-to-date based on their relevant dates and reminder settings.
 */
const syncRenewalTrackerStatus = async (): Promise<number> => {
  // current date
  const now = new Date();

  const renewalTrackers = await RenewalTracker.find({
    expiryOrDueDate: { $lte: now },
  });

  let updateCount = 0;

  for (const tracker of renewalTrackers) {
    const nextStatus = deriveRenewalTrackerStatus({
      startDate: tracker.startDate,
      expiryOrDueDate: tracker.expiryOrDueDate,
      reminderSet: tracker.reminderSet !== undefined ? !!tracker.reminderSet : undefined,
      reminderDate: tracker.reminderDate,
    });

    if (tracker.status !== nextStatus) {
      await RenewalTracker.findByIdAndUpdate(tracker._id, { status: nextStatus });
      updateCount++;
    }
  }

  return updateCount;
};

/**
 * Service function to delete a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to delete.
 * @returns {Promise<Partial<IRenewalTracker>>} - The deleted renewal-tracker.
 */
const deleteRenewalTracker = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IRenewalTracker | null>> => {
  const existingRenewalTracker = await RenewalTracker.findById(id)
    .select('standAloneId createdBy')
    .lean();
  if (!existingRenewalTracker) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingRenewalTracker, accessOwnerId)) {
    return null;
  }

  const deletedRenewalTracker = await RenewalTracker.findByIdAndDelete(id);
  return deletedRenewalTracker;
};

/**
 * Service function to retrieve a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to retrieve.
 * @returns {Promise<Partial<IRenewalTracker>>} - The retrieved renewal-tracker.
 */
const getRenewalTrackerById = async (
  id: IdOrIdsInput['id'],
  options: {
    requesterId: string;
    requesterRole: UserRole;
    standAloneId?: string;
  }
): Promise<Partial<IRenewalTracker | null>> => {
  const ownerIdForScope =
    options.requesterRole === UserRole.TRANSPORT_MANAGER
      ? options.standAloneId
      : options.requesterId;

  if (!ownerIdForScope) return null;

  const ownerObjectId = new mongoose.Types.ObjectId(String(ownerIdForScope));

  const renewalTracker = await RenewalTracker.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  })
    .populate({ path: 'refOrPolicyNo', select: 'policyName' })
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .lean();

  if (!renewalTracker) return null;

  return mapPolicyProcedureRefs(renewalTracker) as any;
};

/**
 * Service function to retrieve multiple renewal-tracker based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The retrieved renewal-tracker
 */
const getManyRenewalTracker = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
  }
): Promise<{
  renewalTrackers: Partial<IRenewalTracker>[];
  totalData: number;
  totalPages: number;
}> => {
  const {
    searchKey = '',
    showPerPage = 10,
    pageNo = 1,
    standAloneId,
    requesterId,
    requesterRole,
  } = query;

  const searchFilter: any = {};

  if (searchKey?.trim()) {
    searchFilter.$or = [
      { type: { $regex: searchKey, $options: 'i' } },
      { item: { $regex: searchKey, $options: 'i' } },
      { description: { $regex: searchKey, $options: 'i' } },
      { providerOrIssuer: { $regex: searchKey, $options: 'i' } },
      { notes: { $regex: searchKey, $options: 'i' } },
    ];
  }

  const ownerIds = new Set<string>();

  if (requesterRole === UserRole.STANDALONE_USER && requesterId) {
    ownerIds.add(String(requesterId));
  }

  if (requesterRole === UserRole.TRANSPORT_MANAGER && standAloneId) {
    ownerIds.add(String(standAloneId));
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    });
  }

  const skipItems = (pageNo - 1) * showPerPage;
  const totalData = await RenewalTracker.countDocuments(searchFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const renewalTrackers = await RenewalTracker.find(searchFilter)
    .populate({ path: 'refOrPolicyNo', select: 'policyName' })
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .skip(skipItems)
    .limit(showPerPage)
    .lean();

  const mappedRenewalTrackers = renewalTrackers.map((tracker) => mapPolicyProcedureRefs(tracker));

  return { renewalTrackers: mappedRenewalTrackers as any, totalData, totalPages };
};

export const renewalTrackerServices = {
  createRenewalTracker,
  updateRenewalTracker,
  deleteRenewalTracker,
  getRenewalTrackerById,
  getManyRenewalTracker,
  syncRenewalTrackerStatus,
};
