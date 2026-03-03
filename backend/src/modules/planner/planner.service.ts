// Import the model
import mongoose from 'mongoose';
import PlannerSchema, { IPlanner } from '../../models/vehicle-transport/planner.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { CreatePlannerInput, UpdatePlannerInput } from './planner.validation';

// Helper function to check if the user has access to the document based on ownership`
const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new planner as Transport Manager
 *
 * @param {CreatePlannerInput} data - The data to create a new planner as Transport Manager
 * @returns {Promise<Partial<IPlanner>>} - The created planner
 * @throws {Error} - Throws an error if the planner creation fails
 */
const createPlannerAsManager = async (data: CreatePlannerInput): Promise<Partial<IPlanner>> => {
  const newPlanner = new PlannerSchema(data as any);
  const savedPlanner = await newPlanner.save();
  return savedPlanner;
};

/**
 * Service function to create a new planner as Standalone User
 *
 * @param {CreatePlannerInput} data - The data to create a new planner as Standalone User
 * @returns {Promise<Partial<IPlanner>>} - The created planner
 * @throws {Error} - Throws an error if the planner creation fails
 */
const createPlannerAsStandAlone = async (data: CreatePlannerInput): Promise<Partial<IPlanner>> => {
  const newPlanner = new PlannerSchema(data as any);
  const savedPlanner = await newPlanner.save();
  return savedPlanner;
};

/**
 * Service function to update a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update.
 * @param {UpdatePlannerInput} data - The updated data for the planner.
 * @returns {Promise<Partial<IPlanner>>} - The updated planner.
 */
const updatePlanner = async (
  id: IdOrIdsInput['id'],
  data: UpdatePlannerInput
): Promise<Partial<IPlanner | null>> => {
  // Check for duplicate (filed) combination
  const existingPlanner = await PlannerSchema.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingPlanner) {
    throw new Error('Duplicate detected: Another planner with the same fieldName already exists.');
  }
  // Proceed to update the planner
  const updatedPlanner = await PlannerSchema.findByIdAndUpdate(id, data, { new: true });
  return updatedPlanner;
};

/**
 * Service function to delete a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to delete.
 * @returns {Promise<Partial<IPlanner>>} - The deleted planner.
 */
const deletePlanner = async (id: IdOrIdsInput['id']): Promise<Partial<IPlanner | null>> => {
  const deletedPlanner = await PlannerSchema.findByIdAndDelete(id);
  return deletedPlanner;
};

/**
 * Service function to retrieve a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve.
 * @returns {Promise<Partial<IPlanner>>} - The retrieved planner.
 */
const getPlannerById = async (id: IdOrIdsInput['id']): Promise<Partial<IPlanner | null>> => {
  const planner = await PlannerSchema.findById(id);
  return planner;
};

/**
 * Service function to retrieve multiple planner based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering planner.
 * @returns {Promise<Partial<IPlanner>[]>} - The retrieved planner
 */
const getManyPlanner = async (
  query: SearchQueryInput & { standAloneId?: string }
): Promise<{ planners: Partial<IPlanner>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query;
  // Build the search filter based on the search key
  const searchFilter = searchKey
    ? {
        $or: [
          { serviceName: { $regex: searchKey, $options: 'i' } },
          { description: { $regex: searchKey, $options: 'i' } },
          { serviceLink: { $regex: searchKey, $options: 'i' } },
        ],
      }
    : {};

  const filter: any = { ...searchFilter };

  if (standAloneId) {
    const ownerFilter = {
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(standAloneId) },
      ],
    };

    if (Object.keys(filter).length > 0) {
      Object.assign(filter, { $and: [searchFilter, ownerFilter] });
      delete filter.$or;
    } else {
      Object.assign(filter, ownerFilter);
    }
  }

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching planner
  const totalData = await PlannerSchema.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find planners based on the search filter with pagination
  const planners = await PlannerSchema.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { planners, totalData, totalPages };
};

export const plannerServices = {
  createPlannerAsManager,
  createPlannerAsStandAlone,
  updatePlanner,
  deletePlanner,
  getPlannerById,
  getManyPlanner,
};

