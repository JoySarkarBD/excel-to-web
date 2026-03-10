import mongoose from 'mongoose';
import TrafficCommissionerCommunicationModel, {
  ITrafficCommissionerCommunication,
} from '../../models/compliance-enforcement-dvsa/trafficCommissionerCommunication.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateTrafficCommissionerCommunicationAsStandAloneInput,
  CreateTrafficCommissionerCommunicationAsTransportManagerInput,
  UpdateTrafficCommissionerCommunicationInput,
} from './traffic-commissioner-communication.validation';

const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new traffic-commissioner-communication as a Transport Manager.
 *
 * @param {CreateTrafficCommissionerCommunicationAsTransportManagerInput} data - The data to create a new communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created traffic-commissioner-communication.
 */
const createTrafficCommissionerCommunicationAsTransportManager = async (
  data: CreateTrafficCommissionerCommunicationAsTransportManagerInput
): Promise<Partial<ITrafficCommissionerCommunication>> => {
  const newTrafficCommissionerCommunication = new TrafficCommissionerCommunicationModel(data);
  const savedTrafficCommissionerCommunication = await newTrafficCommissionerCommunication.save();
  return savedTrafficCommissionerCommunication;
};

/**
 * Service function to create a new traffic-commissioner-communication as a Stand-alone User.
 *
 * @param {CreateTrafficCommissionerCommunicationAsStandAloneInput} data - The data to create a new communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created traffic-commissioner-communication.
 */
const createTrafficCommissionerCommunicationAsStandAlone = async (
  data: CreateTrafficCommissionerCommunicationAsStandAloneInput
): Promise<Partial<ITrafficCommissionerCommunication>> => {
  const newTrafficCommissionerCommunication = new TrafficCommissionerCommunicationModel(data);
  const savedTrafficCommissionerCommunication = await newTrafficCommissionerCommunication.save();
  return savedTrafficCommissionerCommunication;
};

/**
 * Service function to update a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to update.
 * @param {UpdateTrafficCommissionerCommunicationInput} data - The updated data for the traffic-commissioner-communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The updated traffic-commissioner-communication.
 */
const updateTrafficCommissionerCommunication = async (
  id: IdOrIdsInput['id'],
  data: UpdateTrafficCommissionerCommunicationInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<Partial<ITrafficCommissionerCommunication | null>> => {
  const existingTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findById(id)
      .select('standAloneId createdBy')
      .lean();
  if (!existingTrafficCommissionerCommunication) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingTrafficCommissionerCommunication, accessOwnerId)) {
    return null;
  }

  const updatedTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findByIdAndUpdate(id, data, { new: true });
  return updatedTrafficCommissionerCommunication;
};

/**
 * Service function to delete a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to delete.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The deleted traffic-commissioner-communication.
 */
const deleteTrafficCommissionerCommunication = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<ITrafficCommissionerCommunication | null>> => {
  const existingTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findById(id)
      .select('standAloneId createdBy')
      .lean();
  if (!existingTrafficCommissionerCommunication) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingTrafficCommissionerCommunication, accessOwnerId)) {
    return null;
  }

  const deletedTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findByIdAndDelete(id);
  return deletedTrafficCommissionerCommunication;
};

/**
 * Service function to retrieve a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to retrieve.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The retrieved traffic-commissioner-communication.
 */
const getTrafficCommissionerCommunicationById = async (
  id: IdOrIdsInput['id'],
  options?: {
    requesterId?: string;
    requesterRole?: string;
    standAloneId?: string;
  }
): Promise<Partial<ITrafficCommissionerCommunication | null>> => {
  const { requesterId, standAloneId } = options || {};
  const ownerObjectId = standAloneId
    ? new mongoose.Types.ObjectId(standAloneId)
    : requesterId
      ? new mongoose.Types.ObjectId(requesterId)
      : undefined;

  if (!ownerObjectId) {
    return TrafficCommissionerCommunicationModel.findById(id).lean();
  }

  const trafficCommissionerCommunication = await TrafficCommissionerCommunicationModel.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  }).lean();

  return trafficCommissionerCommunication;
};

/**
 * Service function to retrieve multiple traffic-commissioner-communication based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering traffic-commissioner-communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>[]>} - The retrieved traffic-commissioner-communication
 */
const getManyTrafficCommissionerCommunication = async (
  query: SearchQueryInput & { standAloneId?: string; requesterId?: string; requesterRole?: string }
): Promise<{
  trafficCommissionerCommunications: Partial<ITrafficCommissionerCommunication>[];
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
  const searchFilter = searchKey
    ? {
        $or: [
          { type: { $regex: searchKey, $options: 'i' } },
          { contactedPerson: { $regex: searchKey, $options: 'i' } },
          { reason: { $regex: searchKey, $options: 'i' } },
        ],
      }
    : {};

  const filter: any = { ...searchFilter };

  // Build owner filter based on role
  const ownerIds = new Set<string>();

  if (requesterRole === 'TRANSPORT_MANAGER' && standAloneId) {
    ownerIds.add(String(standAloneId));
  } else if (requesterId) {
    ownerIds.add(String(requesterId));
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));
    const ownerFilter = {
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    };

    if (Object.keys(searchFilter).length > 0) {
      Object.assign(filter, { $and: [searchFilter, ownerFilter] });
      delete filter.$or;
    } else {
      Object.assign(filter, ownerFilter);
    }
  }

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching traffic-commissioner-communication
  const totalData = await TrafficCommissionerCommunicationModel.countDocuments(filter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find traffic-commissioner-communications based on the search filter with pagination
  const trafficCommissionerCommunications = await TrafficCommissionerCommunicationModel.find(filter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { trafficCommissionerCommunications, totalData, totalPages };
};

export const trafficCommissionerCommunicationServices = {
  createTrafficCommissionerCommunicationAsTransportManager,
  createTrafficCommissionerCommunicationAsStandAlone,
  updateTrafficCommissionerCommunication,
  deleteTrafficCommissionerCommunication,
  getTrafficCommissionerCommunicationById,
  getManyTrafficCommissionerCommunication,
};
