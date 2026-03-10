// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { DriverTachograph, FuelUsage, Vehicle } from '../../models';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import {
  CreateDriverAsStandAloneInput,
  CreateDriverAsTransportManagerInput,
  SearchDriverQueryInput,
  UpdateDriverInput,
} from './driver.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new driver as a Transport Manager.
 *
 * @param {CreateDriverAsTransportManagerInput} data - The data to create a new driver.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 */
const createDriverAsTransportManager = async (
  data: CreateDriverAsTransportManagerInput
): Promise<Partial<IDriver>> => {
  // Check for duplicate driver by licenseNumber or niNumber
  const existingDriver = await DriverModel.findOne({
    $or: [
      { licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') } },
      { niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } },
    ],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

/**
 * Service function to create a new driver as a Stand-alone User.
 *
 * @param {CreateDriverAsStandAloneInput} data - The data to create a new driver.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 */
const createDriverAsStandAlone = async (
  data: CreateDriverAsStandAloneInput
): Promise<Partial<IDriver>> => {
  const existingDriver = await DriverModel.findOne({
    $or: [
      { licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') } },
      { niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } },
    ],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

/**
 * Service function to update a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update.
 * @param {UpdateDriverInput} data - The updated data for the driver.
 * @returns {Promise<Partial<IDriver>>} - The updated driver.
 */
const updateDriver = async (
  id: IdOrIdsInput['id'],
  data: UpdateDriverInput,
  userId: string,
  standAloneId?: string
): Promise<Partial<IDriver | null>> => {
  // Build $or conditions only for fields provided in `data`
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];

  if (data.licenseNumber) {
    orConditions.push({
      licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') },
    });
  }
  if (data.niNumber) {
    orConditions.push({ niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } });
  }
  if (data.postCode) {
    orConditions.push({ postCode: { $regex: new RegExp(`^${escapeRegex(data.postCode)}$`, 'i') } });
  }
  if (data.nextCheckDueDate) orConditions.push({ nextCheckDueDate: data.nextCheckDueDate });
  if (data.licenseExpiry) orConditions.push({ licenseExpiry: data.licenseExpiry });
  if (data.licenseExpiryDTC) orConditions.push({ licenseExpiryDTC: data.licenseExpiryDTC });
  if (data.cpcExpiry) orConditions.push({ cpcExpiry: data.cpcExpiry });
  if (typeof data.points !== 'undefined') orConditions.push({ points: data.points });
  if (Array.isArray(data.endorsementCodes) && data.endorsementCodes.length)
    orConditions.push({ endorsementCodes: { $all: data.endorsementCodes } });
  if (data.lastChecked) orConditions.push({ lastChecked: data.lastChecked });
  if (typeof data.checkFrequencyDays !== 'undefined')
    orConditions.push({ checkFrequencyDays: data.checkFrequencyDays });
  if (typeof data.employed !== 'undefined') orConditions.push({ employed: data.employed });
  if (data.checkStatus) orConditions.push({ checkStatus: data.checkStatus });
  if (Array.isArray(data.attachments) && data.attachments.length)
    orConditions.push({ attachments: { $all: data.attachments } });

  if (orConditions.length > 0) {
    const existingDriver = await DriverModel.findOne({
      _id: { $ne: id },
      $or: [
        {
          licenseNumber: data.licenseNumber
            ? { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') }
            : undefined,
        },
        {
          niNumber: data.niNumber
            ? { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') }
            : undefined,
        },
      ],
    }).lean();
    if (existingDriver) {
      throw new Error('Duplicate detected: Another driver with the same field(s) already exists.');
    }
  }
  const accessFilters: Record<string, unknown>[] = [
    { createdBy: userId },
    { standAloneId: userId },
  ];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    accessFilters.push({ createdBy: userObjectId });
    accessFilters.push({ standAloneId: userObjectId });
  }

  if (standAloneId) {
    accessFilters.push({ standAloneId });
    accessFilters.push({ createdBy: standAloneId });

    if (mongoose.Types.ObjectId.isValid(standAloneId)) {
      const standAloneObjectId = new mongoose.Types.ObjectId(standAloneId);
      accessFilters.push({ standAloneId: standAloneObjectId });
      accessFilters.push({ createdBy: standAloneObjectId });
    }
  }

  // Proceed to update the driver
  const updatedDriver = await DriverModel.findOneAndUpdate(
    {
      _id: id,
      $or: accessFilters,
    },
    data,
    { returnDocument: 'after' }
  );
  return updatedDriver;
};

/**
 * Service function to delete a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete.
 * @returns {Promise<Partial<IDriver>>} - The deleted driver.
 */

// TODO: Before deleting a driver, we should check if there are any related records in DriverTachograph, FuelUsage, or Vehicle collections. If there are related records, we should prevent deletion and throw an error to maintain data integrity.

const deleteDriver = async (
  id: IdOrIdsInput['id'],
  userId: string
): Promise<Partial<IDriver | null>> => {
  const [driverTachographExists, fuelUsageExists, vehicleExists] = await Promise.all([
    DriverTachograph.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
    FuelUsage.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
    Vehicle.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
  ]);

  // if any of the related records exist, prevent deletion and throw an error
  if (driverTachographExists || fuelUsageExists || vehicleExists) {
    throw new Error(
      'Cannot delete driver with associated tachograph records, fuel usage records, or assigned vehicles.'
    );
  }

  const ownershipFilters: Record<string, unknown>[] = [
    { createdBy: userId },
    { standAloneId: userId },
  ];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    ownershipFilters.push({ createdBy: userObjectId });
    ownershipFilters.push({ standAloneId: userObjectId });
  }

  const deletedDriver = await DriverModel.findOneAndDelete({
    _id: id,
    $or: ownershipFilters,
  });
  return deletedDriver;
};

/**
 * Service function to retrieve a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve.
 * @param {IdOrIdsInput['standAloneId']} [standAloneId] - Optional stand-alone ID for additional filtering.
 * @param {IdOrIdsInput['createdById']} [createdById] - Optional createdBy ID for additional filtering.
 * @returns {Promise<Partial<IDriver>>} - The retrieved driver.
 */
const getDriverById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IDriver | null>> => {
  const accessFilters: Record<string, mongoose.Types.ObjectId>[] = [];

  if (standAloneId) {
    const standAloneObjectId = new mongoose.Types.ObjectId(standAloneId);
    accessFilters.push({ standAloneId: standAloneObjectId });
    accessFilters.push({ createdBy: standAloneObjectId });
  }

  if (createdBy) {
    accessFilters.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  const filter = accessFilters.length
    ? {
        _id: id,
        $or: accessFilters,
      }
    : { _id: id };

  const driver = await DriverModel.findOne(filter);
  return driver;
};

/**
 * Service function to retrieve multiple driver based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering driver.
 * @returns {Promise<Partial<IDriver>[]>} - The retrieved driver
 */
const getManyDriver = async (
  query: SearchDriverQueryInput & { createdBy?: string }
): Promise<{
  drivers: Partial<IDriver>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;

  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  // Search filter
  if (searchKey) {
    searchConditions.push({
      $or: [
        { fullName: { $regex: searchKey, $options: 'i' } },
        { licenseNumber: { $regex: searchKey, $options: 'i' } },
        { niNumber: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  // For Transport Manager: filter by BOTH standAloneId (the specific client) AND createdBy (the manager).
  // Using AND ensures we only return drivers belonging to that exact client AND created by this manager.
  if (standAloneId) {
    andConditions.push({ standAloneId: new mongoose.Types.ObjectId(standAloneId) });
    if (createdBy) {
      andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
    }
  } else if (createdBy) {
    // Stand-alone user: filter by createdBy only
    andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  // Final filter build
  const finalFilter: any = {};

  if (searchConditions.length) {
    finalFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    finalFilter.$and = [...(finalFilter.$and || []), ...andConditions];
  }

  // Pagination
  const skipItems = (pageNo - 1) * showPerPage;

  const totalData = await DriverModel.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalData / showPerPage);

  const drivers = await DriverModel.find(finalFilter).skip(skipItems).limit(showPerPage).select('');

  return { drivers, totalData, totalPages };
};

export const driverServices = {
  createDriverAsTransportManager,
  createDriverAsStandAlone,
  updateDriver,
  deleteDriver,
  getDriverById,
  getManyDriver,
};
