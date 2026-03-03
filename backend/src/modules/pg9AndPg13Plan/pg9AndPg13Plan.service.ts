import mongoose from 'mongoose';
import { pg9AndPg13Plan, Ipg9AndPg13Plan, Vehicle } from '../../models';
import {
  CreatePg9AndPg13PlanAsManagerInput,
  CreatePg9AndPg13PlanAsStandAloneInput,
  UpdatePg9AndPg13PlanInput,
  SearchPg9AndPg13PlansQueryInput,
} from './pg9AndPg13Plan.validation';

/**
 * Verifies the vehicle belongs to the standalone user.
 * Checks that Vehicle exists AND its standAloneId or createdBy matches accessId.
 */
const verifyVehicleUnderStandalone = async (
  vehicleId: string,
  accessId: string
): Promise<void> => {
  const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
  const objectId = new mongoose.Types.ObjectId(accessId);

  const vehicle = await Vehicle.exists({
    _id: vehicleObjectId,
    $or: [{ standAloneId: objectId }, { createdBy: objectId }],
  });

  if (!vehicle) throw new Error('Vehicle not found or does not belong to this user');
};

/**
 * Service: Create a PG9 & PG13 plan as a Transport Manager.
 * Requires standAloneId to link to the standalone user's vehicle.
 * @param data - The input data for creating the plan, including createdBy and standAloneId.
 */
const createPg9AndPg13PlanAsManager = async (
  data: CreatePg9AndPg13PlanAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<Ipg9AndPg13Plan> => {
  // Verify vehicle belongs to the standalone user
  await verifyVehicleUnderStandalone(data.vehicleId, data.standAloneId);

  const doc: Record<string, any> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    issueType: data.issueType,
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.defectDescription !== undefined) doc.defectDescription = data.defectDescription;
  if (data.clearanceStatus !== undefined) doc.clearanceStatus = data.clearanceStatus;
  if (data.tcContactMade !== undefined) doc.tcContactMade = data.tcContactMade;
  if (data.maintenanceProvider !== undefined) doc.maintenanceProvider = data.maintenanceProvider;
  if (data.meetingDate !== undefined) doc.meetingDate = new Date(data.meetingDate);
  if (data.notes !== undefined) doc.notes = data.notes;
  if (data.followUp !== undefined) doc.followUp = data.followUp;

  const newDoc = new pg9AndPg13Plan(doc);
  return await newDoc.save();
};

/**
 * Service: Create a PG9 & PG13 plan as a Standalone User.
 * No standAloneId needed since createdBy is the standalone user.
 * @param data - The input data for creating the plan, including createdBy.
 */
const createPg9AndPg13PlanAsStandAlone = async (
  data: CreatePg9AndPg13PlanAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<Ipg9AndPg13Plan> => {
  // Verify vehicle belongs to the standalone user
  await verifyVehicleUnderStandalone(data.vehicleId, data.createdBy.toString());

  const doc: Record<string, any> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    issueType: data.issueType,
    createdBy: data.createdBy,
  };
  if (data.defectDescription !== undefined) doc.defectDescription = data.defectDescription;
  if (data.clearanceStatus !== undefined) doc.clearanceStatus = data.clearanceStatus;
  if (data.tcContactMade !== undefined) doc.tcContactMade = data.tcContactMade;
  if (data.maintenanceProvider !== undefined) doc.maintenanceProvider = data.maintenanceProvider;
  if (data.meetingDate !== undefined) doc.meetingDate = new Date(data.meetingDate);
  if (data.notes !== undefined) doc.notes = data.notes;
  if (data.followUp !== undefined) doc.followUp = data.followUp;

  const newDoc = new pg9AndPg13Plan(doc);
  return await newDoc.save();
};

/**
 * Service: Get all PG9 & PG13 plans (paginated + searchable).
 * Uses aggregation with $or access control and $lookup for vehicle details.
 */
const getAllPg9AndPg13Plans = async (
  query: SearchPg9AndPg13PlansQueryInput
): Promise<{ pg9AndPg13Plans: any[]; totalData: number; totalPages: number }> => {
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

  // Lookup vehicle details for search
  basePipeline.push(
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } }
  );

  // Search filter on vehicle.vehicleRegId, issueType, defectDescription, clearanceStatus, maintenanceProvider
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'vehicle.vehicleRegId': { $regex: searchKey, $options: 'i' } },
          { issueType: { $regex: searchKey, $options: 'i' } },
          { defectDescription: { $regex: searchKey, $options: 'i' } },
          { clearanceStatus: { $regex: searchKey, $options: 'i' } },
          { maintenanceProvider: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await pg9AndPg13Plan.aggregate([
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

  return { pg9AndPg13Plans: result.data, totalData, totalPages };
};

/**
 * Service: Get a single PG9 & PG13 plan by ID.
 * Uses $or access control on createdBy / standAloneId.
 */
const getPg9AndPg13PlanById = async (
  pg9AndPg13PlanId: string,
  accessId?: string
): Promise<Ipg9AndPg13Plan> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(pg9AndPg13PlanId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [{ createdBy: objectId }, { standAloneId: objectId }];
  }

  const doc = await pg9AndPg13Plan.findOne(filter);
  if (!doc) throw new Error('PG9 & PG13 plan not found or access denied');
  return doc;
};

/**
 * Service: Update a PG9 & PG13 plan.
 * Uses $or access control on createdBy / standAloneId.
 * If vehicleId changes, re-verify ownership.
 */
const updatePg9AndPg13Plan = async (
  pg9AndPg13PlanId: string,
  data: UpdatePg9AndPg13PlanInput,
  accessId: string
): Promise<Ipg9AndPg13Plan> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  // If vehicleId changes, verify the new vehicle belongs to the user
  if (data.vehicleId) {
    await verifyVehicleUnderStandalone(data.vehicleId, accessId);
  }

  const updateFields: Record<string, any> = {};
  if (data.vehicleId !== undefined) updateFields.vehicleId = new mongoose.Types.ObjectId(data.vehicleId);
  if (data.issueType !== undefined) updateFields.issueType = data.issueType;
  if (data.defectDescription !== undefined) updateFields.defectDescription = data.defectDescription;
  if (data.clearanceStatus !== undefined) updateFields.clearanceStatus = data.clearanceStatus;
  if (data.tcContactMade !== undefined) updateFields.tcContactMade = data.tcContactMade;
  if (data.maintenanceProvider !== undefined) updateFields.maintenanceProvider = data.maintenanceProvider;
  if (data.meetingDate !== undefined) updateFields.meetingDate = new Date(data.meetingDate);
  if (data.notes !== undefined) updateFields.notes = data.notes;
  if (data.followUp !== undefined) updateFields.followUp = data.followUp;

  const updated = await pg9AndPg13Plan.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(pg9AndPg13PlanId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('PG9 & PG13 plan not found or access denied');
  return updated;
};

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Delete a PG9 & PG13 plan.
 * Uses $or access control on createdBy / standAloneId.
 */
const deletePg9AndPg13Plan = async (
  pg9AndPg13PlanId: string,
  accessId: string
): Promise<void> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const deleted = await pg9AndPg13Plan.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(pg9AndPg13PlanId),
    $or: [{ createdBy: objectId }, { standAloneId: objectId }],
  });

  if (!deleted) throw new Error('PG9 & PG13 plan not found or access denied');
};

export const pg9AndPg13PlanServices = {
  createPg9AndPg13PlanAsManager,
  createPg9AndPg13PlanAsStandAlone,
  getAllPg9AndPg13Plans,
  getPg9AndPg13PlanById,
  updatePg9AndPg13Plan,
  deletePg9AndPg13Plan,
};