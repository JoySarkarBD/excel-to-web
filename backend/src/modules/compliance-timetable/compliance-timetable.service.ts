// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateComplianceTimetableAsStandAloneInput,
  CreateComplianceTimetableAsTransportManagerInput,
  CreateComplianceTimetableInput,
  SearchComplianceTimetableQueryInput,
  UpdateComplianceTimetableInput,
} from './compliance-timetable.validation';
import ComplianceTimeTableModel, {
  IComplianceTimeTable,
} from '../../models/compliance-enforcement-dvsa/complianceTimeTable.schema';
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new compliance-timetable.
 *
 * @param {CreateComplianceTimetableInput} data - The data to create a new compliance-timetable.
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The created compliance-timetable.
 */
const createComplianceTimetable = async (
  data:
    | CreateComplianceTimetableAsStandAloneInput
    | CreateComplianceTimetableAsTransportManagerInput
): Promise<Partial<IComplianceTimeTable>> => {
  // Prevent duplicates by task (case-insensitive)
  const or: any[] = [];
  if (data.task) {
    or.push({ task: { $regex: new RegExp(`^${escapeRegex(data.task)}$`, 'i') } });
  }

  if (or.length > 0) {
    const existingComplianceTimetable = await ComplianceTimeTableModel.findOne({ $or: or }).lean();
    if (existingComplianceTimetable) throw new Error('Compliance-timetable already exists');
  }

  const newComplianceTimetable = new ComplianceTimeTableModel(data);
  const savedComplianceTimetable = await newComplianceTimetable.save();
  return savedComplianceTimetable;
};

/**
 * Service function to update a single compliance-timetable by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to update.
 * @param {UpdateComplianceTimetableInput} data - The updated data for the compliance-timetable.
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The updated compliance-timetable.
 */
const updateComplianceTimetable = async (
  id: IdOrIdsInput['id'],
  data: UpdateComplianceTimetableInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IComplianceTimeTable | null>> => {
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];
  if (data.task)
    orConditions.push({
      task: { $regex: new RegExp(`^${escapeRegex(data.task)}$`, 'i') },
    });

  if (orConditions.length > 0) {
    const existingComplianceTimetable = await ComplianceTimeTableModel.findOne({
      _id: { $ne: id }, // Exclude the current document
      $or: [
        {
          task: data.task ? { $regex: new RegExp(`^${escapeRegex(data.task)}$`, 'i') } : undefined,
        },
      ],
    }).lean();
    if (existingComplianceTimetable) {
      throw new Error(
        'Duplicate detected: Another compliance-timetable with the same task already exists.'
      );
    }
  }

  const accessFilters: Record<string, unknown>[] = [];

  if (userId) {
    accessFilters.push({ createdBy: userId });
    accessFilters.push({ standAloneId: userId });

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      accessFilters.push({ createdBy: userObjectId });
      accessFilters.push({ standAloneId: userObjectId });
    }
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

  // Proceed to update the compliance-timetable
  const updatedComplianceTimetable = await ComplianceTimeTableModel.findOneAndUpdate(
    {
      _id: id,
      $or: accessFilters,
    },
    data,
    { returnDocument: 'after' }
  );

  return updatedComplianceTimetable;
};

/**
 * Service function to delete a single compliance-timetable by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to delete.
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The deleted compliance-timetable.
 */
const deleteComplianceTimetable = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IComplianceTimeTable | null>> => {
  const accessFilters: Record<string, unknown>[] = [];

  if (userId) {
    accessFilters.push({ createdBy: userId });
    accessFilters.push({ standAloneId: userId });

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      accessFilters.push({ createdBy: userObjectId });
      accessFilters.push({ standAloneId: userObjectId });
    }
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

  const deletedComplianceTimetable = await ComplianceTimeTableModel.findOneAndDelete({
    _id: id,
    $or: accessFilters,
  });
  return deletedComplianceTimetable;
};

/**
 * Service function to delete multiple compliance-timetable.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of compliance-timetable to delete.
 * @returns {Promise<Partial<IComplianceTimeTable>[]>} - The deleted compliance-timetable.
 */
const deleteManyComplianceTimetable = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<IComplianceTimeTable>[]> => {
  const complianceTimetableToDelete = await ComplianceTimeTableModel.find({ _id: { $in: ids } });
  if (!complianceTimetableToDelete.length)
    throw new Error('No compliance-timetable found to delete');
  await ComplianceTimeTableModel.deleteMany({ _id: { $in: ids } });
  return complianceTimetableToDelete;
};

/**
 * Service function to retrieve a single compliance-timetable by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to retrieve.
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The retrieved compliance-timetable.
 */
const getComplianceTimetableById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IComplianceTimeTable | null>> => {
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

  const complianceTimetable = await ComplianceTimeTableModel.findOne(filter);
  return complianceTimetable;
};

/**
 * Service function to retrieve multiple compliance-timetable based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering compliance-timetable.
 * @returns {Promise<Partial<IComplianceTimeTable>[]>} - The retrieved compliance-timetable
 */
const getAllComplianceTimetable = async (
  query: SearchComplianceTimetableQueryInput & { createdBy?: string }
): Promise<{
  complianceTimetables: Partial<IComplianceTimeTable>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;
  // Build the search filter based on the search key
  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  if (searchKey) {
    searchConditions.push({
      $or: [
        { task: { $regex: searchKey, $options: 'i' } },
        { responsibleParty: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  if (standAloneId) {
    andConditions.push({
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(createdBy!) },
      ],
    });
  } else if (createdBy) {
    andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  const searchFilter: any = {};

  if (searchConditions.length) {
    searchFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    searchFilter.$and = [...(searchFilter.$and || []), ...andConditions];
  }
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching compliance-timetable
  const totalData = await ComplianceTimeTableModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find compliance-timetables based on the search filter with pagination
  const complianceTimetables = await ComplianceTimeTableModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select('') // Keep/Exclude any field if needed
  return { complianceTimetables, totalData, totalPages };
};

export const complianceTimetableServices = {
  createComplianceTimetable,
  updateComplianceTimetable,
  deleteComplianceTimetable,
  deleteManyComplianceTimetable,
  getComplianceTimetableById,
  getAllComplianceTimetable,
};
