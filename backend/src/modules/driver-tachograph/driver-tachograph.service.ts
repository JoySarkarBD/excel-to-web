// Import the model
import mongoose from 'mongoose';
import DriverTachographModel, {
  IDriverTachograph,
} from '../../models/vehicle-transport/driverTachograph.schema';
import Vehicle from '../../models/vehicle-transport/vehicle.schema';
import Driver from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { ClientManagement, ClientStatus, UserRole } from '../../models';
import {
  CreateDriverTachographInput,
  CreateDriverTachographAsManagerInput,
  CreateDriverTachographAsStandAloneInput,
  UpdateDriverTachographInput,
} from './driver-tachograph.validation';

const resolveOwnerId = (entity: any): string | null => {
  if (!entity) return null;
  return entity.standAloneId
    ? entity.standAloneId.toString()
    : entity.createdBy
      ? entity.createdBy.toString()
      : null;
};

/**
 * Service function to create a new driver-tachograph as transport manager.
 *
 * @param {CreateDriverTachographAsManagerInput} data - The data to create a new driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>>} - The created driver-tachograph.
 */
const createDriverTachographAsManager = async (
  data: CreateDriverTachographAsManagerInput
): Promise<Partial<IDriverTachograph>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId)
    .select('driverIds standAloneId createdBy')
    .lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  // check if driver is assigned to vehicle
  const isDriverAssignedToVehicle =
    Array.isArray((vehicle as any).driverIds) &&
    (vehicle as any).driverIds.some(
      (assignedId: any) => assignedId?.toString?.() === data.driverId.toString()
    );

  if (!isDriverAssignedToVehicle) {
    throw new Error('Driver is not assigned to this vehicle');
  }

  // verify ownership
  const vehicleOwnerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy?.toString();

  if (!vehicleOwnerId) {
    throw new Error('Unable to determine vehicle owner');
  }

  if (String(data.standAloneId) !== vehicleOwnerId) {
    throw new Error('Stand-alone user does not own this vehicle');
  }

  // verify driver exists and belongs to the same owner
  const driver = await Driver.findById(data.driverId).select('standAloneId createdBy').lean();
  if (driver) {
    const driverOwnerId = driver.standAloneId
      ? driver.standAloneId.toString()
      : driver.createdBy?.toString();
    if (driverOwnerId && driverOwnerId !== vehicleOwnerId) {
      throw new Error('Driver and vehicle do not belong to the same owner');
    }
  }

  const newDriverTachograph = new DriverTachographModel(data);
  const savedDriverTachograph = await newDriverTachograph.save();
  return savedDriverTachograph;
};

/**
 * Service function to create a new driver-tachograph as standalone user.
 *
 * @param {CreateDriverTachographAsStandAloneInput} data - The data to create a new driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>>} - The created driver-tachograph.
 */
const createDriverTachographAsStandAlone = async (
  data: CreateDriverTachographAsStandAloneInput
): Promise<Partial<IDriverTachograph>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId)
    .select('driverIds standAloneId createdBy')
    .lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  // check if driver is assigned to vehicle
  const isDriverAssignedToVehicle =
    Array.isArray((vehicle as any).driverIds) &&
    (vehicle as any).driverIds.some(
      (assignedId: any) => assignedId?.toString?.() === data.driverId.toString()
    );

  if (!isDriverAssignedToVehicle) {
    throw new Error('Driver is not assigned to this vehicle');
  }

  // verify ownership
  const vehicleOwnerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy?.toString();

  if (String((data as any).createdBy) !== vehicleOwnerId) {
    throw new Error('You are not the owner of this vehicle');
  }

  // verify driver exists and belongs to the same owner
  const driver = await Driver.findById(data.driverId).select('standAloneId createdBy').lean();
  if (driver) {
    const driverOwnerId = driver.standAloneId
      ? driver.standAloneId.toString()
      : driver.createdBy?.toString();
    if (driverOwnerId && driverOwnerId !== vehicleOwnerId) {
      throw new Error('Driver and vehicle do not belong to the same owner');
    }
  }

  const newDriverTachograph = new DriverTachographModel(data);
  const savedDriverTachograph = await newDriverTachograph.save();
  return savedDriverTachograph;
};

/**
 * Service function to update a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to update.
 * @param {UpdateDriverTachographInput} data - The updated data for the driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>>} - The updated driver-tachograph.
 */
const updateDriverTachograph = async (
  id: IdOrIdsInput['id'],
  data: UpdateDriverTachographInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<Partial<IDriverTachograph | null>> => {
  const existing = await DriverTachographModel.findById(id)
    .select('vehicleId driverId standAloneId createdBy')
    .lean();
  if (!existing) return null;

  // Check ownership of the driver-tachograph record itself
  const tachographOwnerId = resolveOwnerId(existing);
  const accessOwnerId = standAloneId || String(userId);

  if (tachographOwnerId !== accessOwnerId) {
    throw new Error('You do not have permission to update this driver-tachograph');
  }

  // If updating vehicle or driver, validate the new ones still belong to the same owner
  if (data.vehicleId || data.driverId) {
    const effectiveVehicleId = (data.vehicleId || (existing as any).vehicleId)?.toString();
    const effectiveDriverId = (data.driverId || (existing as any).driverId)?.toString();

    // Verify vehicle ownership and driver assignment
    const vehicle = await Vehicle.findById(effectiveVehicleId)
      .select('driverIds standAloneId createdBy')
      .lean();

    if (!vehicle) throw new Error('Vehicle does not exist');

    const vehicleOwnerId = resolveOwnerId(vehicle);
    if (vehicleOwnerId !== accessOwnerId) {
      throw new Error('Vehicle does not belong to you');
    }

    // Check if driver is assigned to vehicle
    const isDriverAssignedToVehicle =
      Array.isArray((vehicle as any).driverIds) &&
      (vehicle as any).driverIds.some(
        (assignedId: any) => assignedId?.toString?.() === effectiveDriverId
      );

    if (!isDriverAssignedToVehicle) {
      throw new Error('Driver is not assigned to this vehicle');
    }

    // Verify driver ownership
    const driver = await Driver.findById(effectiveDriverId).select('standAloneId createdBy').lean();
    if (driver) {
      const driverOwnerId = resolveOwnerId(driver);
      if (driverOwnerId && driverOwnerId !== accessOwnerId) {
        throw new Error('Driver does not belong to you');
      }
    }
  }

  // Proceed to update the driver-tachograph
  const updatedDriverTachograph = await DriverTachographModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedDriverTachograph;
};

/**
 * Service function to delete a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to delete.
 * @returns {Promise<Partial<IDriverTachograph>>} - The deleted driver-tachograph.
 */
const deleteDriverTachograph = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IDriverTachograph | null>> => {
  const existing = await DriverTachographModel.findById(id)
    .select('vehicleId driverId standAloneId createdBy')
    .lean();
  if (!existing) return null;

  // Check ownership of the driver-tachograph record itself
  const tachographOwnerId = resolveOwnerId(existing);
  const accessOwnerId = String(standAloneId || userId);

  if (tachographOwnerId !== accessOwnerId) {
    throw new Error('You do not have permission to delete this driver-tachograph');
  }

  const deletedDriverTachograph = await DriverTachographModel.findByIdAndDelete(id);
  return deletedDriverTachograph;
};

/**
 * Service function to retrieve a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to retrieve.
 * @returns {Promise<Partial<IDriverTachograph>>} - The retrieved driver-tachograph.
 */
const getDriverTachographById = async (id: IdOrIdsInput['id']): Promise<any> => {
  const result = await DriverTachographModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id as string) } },

    // Join Driver
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDoc',
      },
    },
    { $unwind: { path: '$driverDoc', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        driverName: { $ifNull: ['$driverDoc.fullName', null] },
      },
    },

    // Join Vehicle
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicleDoc',
      },
    },
    { $unwind: { path: '$vehicleDoc', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        vehicleRegId: { $ifNull: ['$vehicleDoc.vehicleRegId', null] },
        vehicleType: { $ifNull: ['$vehicleDoc.vehicleType', null] },
        licensePlate: { $ifNull: ['$vehicleDoc.licensePlate', null] },
      },
    },

    // Join User for reviewedBy
    {
      $lookup: {
        from: 'users',
        localField: 'reviewedBy',
        foreignField: '_id',
        as: 'reviewedUser',
      },
    },
    { $unwind: { path: '$reviewedUser', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        reviewedByName: {
          $cond: [
            { $ifNull: ['$reviewedUser', false] },
            {
              $concat: ['$reviewedUser.fullName', ' (', '$reviewedUser.role', ')'],
            },
            null,
          ],
        },
      },
    },

    // Remove joined doc objects
    {
      $project: {
        driverDoc: 0,
        vehicleDoc: 0,
        reviewedUser: 0,
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

/**
 * Service function to retrieve multiple driver-tachograph based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>[]>} - The retrieved driver-tachograph
 */
const getManyDriverTachograph = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
  }
): Promise<{
  driverTachographs: any[];
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

  const matchStage: any = {};

  // Search
  if (searchKey?.trim()) {
    matchStage.$or = [
      { typeOfInfringement: { $regex: searchKey, $options: 'i' } },
      { details: { $regex: searchKey, $options: 'i' } },
      { actionTaken: { $regex: searchKey, $options: 'i' } },
    ];
  }

  // Ownership filtering
  const ownerIds = new Set<string>();

  if (requesterRole === UserRole.STANDALONE_USER && requesterId) {
    // Standalone users can only see their own records
    ownerIds.add(String(requesterId));
  }

  if (requesterRole === UserRole.TRANSPORT_MANAGER) {
    // Transport managers must provide standAloneId to see specific client's records
    if (standAloneId) {
      ownerIds.add(String(standAloneId));
    }
    // If no standAloneId provided, they see no records (or could show error)
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));

    // Find vehicles that belong to the specified owner(s)
    const accessibleVehicles = await Vehicle.find({
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    })
      .select('_id')
      .lean();

    const accessibleVehicleIds = accessibleVehicles.map((v) => v._id);

    // Filter driver-tachographs to only show those with accessible vehicles
    matchStage.vehicleId = { $in: accessibleVehicleIds };
  }

  const skipItems = (pageNo - 1) * showPerPage;

  const result = await DriverTachographModel.aggregate([
    { $match: matchStage },

    // Join Driver
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverDoc',
      },
    },
    { $unwind: { path: '$driverDoc', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        driverName: { $ifNull: ['$driverDoc.fullName', null] },
      },
    },

    // Join Vehicle
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicleDoc',
      },
    },
    { $unwind: { path: '$vehicleDoc', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        vehicleRegId: { $ifNull: ['$vehicleDoc.vehicleRegId', null] },
        vehicleType: { $ifNull: ['$vehicleDoc.vehicleType', null] },
        licensePlate: { $ifNull: ['$vehicleDoc.licensePlate', null] },
      },
    },

    // Join User for reviewedBy
    {
      $lookup: {
        from: 'users',
        localField: 'reviewedBy',
        foreignField: '_id',
        as: 'reviewedUser',
      },
    },
    { $unwind: { path: '$reviewedUser', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        reviewedByName: {
          $cond: [
            { $ifNull: ['$reviewedUser', false] },
            {
              $concat: ['$reviewedUser.fullName', ' (', '$reviewedUser.role', ')'],
            },
            null,
          ],
        },
      },
    },

    // Remove joined doc objects
    {
      $project: {
        driverDoc: 0,
        vehicleDoc: 0,
        reviewedUser: 0,
      },
    },

    // Pagination + Count
    {
      $facet: {
        data: [{ $skip: skipItems }, { $limit: showPerPage }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const driverTachographs = result[0].data;
  const totalData = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { driverTachographs, totalData, totalPages };
};

export const driverTachographServices = {
  createDriverTachographAsManager,
  createDriverTachographAsStandAlone,
  updateDriverTachograph,
  deleteDriverTachograph,
  getDriverTachographById,
  getManyDriverTachograph,
};
