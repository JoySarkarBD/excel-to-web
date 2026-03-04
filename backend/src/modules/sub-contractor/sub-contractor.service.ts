import mongoose from 'mongoose';
import { ISubContractor, SubContractor } from '../../models';
import {
  CreateSubContractorAsManagerInput,
  CreateSubContractorAsStandAloneInput,
  SearchSubContractorsQueryInput,
  UpdateSubContractorInput,
} from './sub-contractor.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Create a sub-contractor as a Transport Manager.
 * The TM's createdBy is set in controller; standAloneId comes from body.
 */
const createSubContractorAsManager = async (
  data: CreateSubContractorAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<ISubContractor> => {
  const doc: Record<string, any> = {
    companyName: data.companyName,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    insurancePolicyNumber: data.insurancePolicyNumber,
    insuranceExpiryDate: new Date(data.insuranceExpiryDate),
    startDateOfAgreement: new Date(data.startDateOfAgreement),
    checkedBy: data.checkedBy,
    hiabAvailable: data.hiabAvailable ?? false,
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.gitPolicyNumber !== undefined) doc.gitPolicyNumber = data.gitPolicyNumber;
  if (data.gitExpiryDate !== undefined) doc.gitExpiryDate = new Date(data.gitExpiryDate);
  if (data.gitCoverPerTonne !== undefined) doc.gitCoverPerTonne = data.gitCoverPerTonne;
  if (data.otherCapabilities !== undefined) doc.otherCapabilities = data.otherCapabilities;
  if (data.rating !== undefined) doc.rating = data.rating;
  if (data.notes !== undefined) doc.notes = data.notes;

  const newDoc = new SubContractor(doc);
  return await newDoc.save();
};

/**
 * Service: Create a sub-contractor as a Standalone User.
 * No standAloneId needed; createdBy is set in controller.
 */
const createSubContractorAsStandAlone = async (
  data: CreateSubContractorAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<ISubContractor> => {
  const doc: Record<string, any> = {
    companyName: data.companyName,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    insurancePolicyNumber: data.insurancePolicyNumber,
    insuranceExpiryDate: new Date(data.insuranceExpiryDate),
    startDateOfAgreement: new Date(data.startDateOfAgreement),
    checkedBy: data.checkedBy,
    hiabAvailable: data.hiabAvailable ?? false,
    createdBy: data.createdBy,
  };
  if (data.gitPolicyNumber !== undefined) doc.gitPolicyNumber = data.gitPolicyNumber;
  if (data.gitExpiryDate !== undefined) doc.gitExpiryDate = new Date(data.gitExpiryDate);
  if (data.gitCoverPerTonne !== undefined) doc.gitCoverPerTonne = data.gitCoverPerTonne;
  if (data.otherCapabilities !== undefined) doc.otherCapabilities = data.otherCapabilities;
  if (data.rating !== undefined) doc.rating = data.rating;
  if (data.notes !== undefined) doc.notes = data.notes;

  const newDoc = new SubContractor(doc);
  return await newDoc.save();
};

// ═══════════════════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all sub-contractors (paginated + searchable).
 * Uses aggregation with $or access control and text search.
 */
const getAllSubContractors = async (
  query: SearchSubContractorsQueryInput
): Promise<{ subContractors: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // Access control
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // Search filter on companyName, contactPerson, email, phone
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { companyName: { $regex: searchKey, $options: 'i' } },
          { contactPerson: { $regex: searchKey, $options: 'i' } },
          { email: { $regex: searchKey, $options: 'i' } },
          { phone: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await SubContractor.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (pageNo - 1) * showPerPage },
          { $limit: showPerPage },
        ],
      },
    },
  ]);

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { subContractors: result.data, totalData, totalPages };
};

/**
 * Service: Get a single sub-contractor by ID.
 * Uses $or access control on createdBy / standAloneId.
 */
const getSubContractorById = async (
  subContractorId: string,
  accessId?: string
): Promise<ISubContractor> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(subContractorId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [{ createdBy: objectId }, { standAloneId: objectId }];
  }

  const doc = await SubContractor.findOne(filter);
  if (!doc) throw new Error('Sub-contractor not found or access denied');
  return doc;
};

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Update a sub-contractor.
 * Uses $or access control on createdBy / standAloneId.
 */
const updateSubContractor = async (
  subContractorId: string,
  data: UpdateSubContractorInput,
  accessId: string
): Promise<ISubContractor> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const updateFields: Record<string, any> = {};
  if (data.companyName !== undefined) updateFields.companyName = data.companyName;
  if (data.contactPerson !== undefined) updateFields.contactPerson = data.contactPerson;
  if (data.phone !== undefined) updateFields.phone = data.phone;
  if (data.email !== undefined) updateFields.email = data.email;
  if (data.insurancePolicyNumber !== undefined)
    updateFields.insurancePolicyNumber = data.insurancePolicyNumber;
  if (data.insuranceExpiryDate !== undefined)
    updateFields.insuranceExpiryDate = new Date(data.insuranceExpiryDate);
  if (data.gitPolicyNumber !== undefined) updateFields.gitPolicyNumber = data.gitPolicyNumber;
  if (data.gitExpiryDate !== undefined) updateFields.gitExpiryDate = new Date(data.gitExpiryDate);
  if (data.gitCoverPerTonne !== undefined) updateFields.gitCoverPerTonne = data.gitCoverPerTonne;
  if (data.hiabAvailable !== undefined) updateFields.hiabAvailable = data.hiabAvailable;
  if (data.otherCapabilities !== undefined) updateFields.otherCapabilities = data.otherCapabilities;
  if (data.startDateOfAgreement !== undefined)
    updateFields.startDateOfAgreement = new Date(data.startDateOfAgreement);
  if (data.rating !== undefined) updateFields.rating = data.rating;
  if (data.checkedBy !== undefined) updateFields.checkedBy = data.checkedBy;
  if (data.notes !== undefined) updateFields.notes = data.notes;

  const updated = await SubContractor.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(subContractorId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('Sub-contractor not found or access denied');
  return updated;
};

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Delete a sub-contractor.
 * Uses $or access control on createdBy / standAloneId.
 */
const deleteSubContractor = async (subContractorId: string, accessId: string): Promise<void> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const deleted = await SubContractor.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(subContractorId),
    $or: [{ createdBy: objectId }, { standAloneId: objectId }],
  });

  if (!deleted) throw new Error('Sub-contractor not found or access denied');
};

export const subContractorServices = {
  createSubContractorAsManager,
  createSubContractorAsStandAlone,
  getAllSubContractors,
  getSubContractorById,
  updateSubContractor,
  deleteSubContractor,
};
