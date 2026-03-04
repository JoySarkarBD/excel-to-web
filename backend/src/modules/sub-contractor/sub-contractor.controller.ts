import { Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import catchAsync from '../../utils/catch-async/catch-async';
import { subContractorServices } from './sub-contractor.service';
import { SearchSubContractorsQueryInput } from './sub-contractor.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Create a sub-contractor as a Transport Manager.
 * POST /api/v1/subContractor/create-sub-contractor
 */
export const createSubContractorAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    const result = await subContractorServices.createSubContractorAsManager(req.body);
    if (!result) throw new Error('Failed to create sub-contractor');
    ServerResponse(res, true, 201, 'Sub-contractor created successfully', result);
  }
);

/**
 * Controller: Create a sub-contractor as a Standalone User.
 * POST /api/v1/subContractor/create-stand-alone-sub-contractor
 */
export const createSubContractorAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await subContractorServices.createSubContractorAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create sub-contractor');
    ServerResponse(res, true, 201, 'Sub-contractor created successfully', result);
  }
);

// ═══════════════════════════════════════════════════════════════
// READ CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all sub-contractors (paginated + searchable).
 * GET /api/v1/subContractor/get-sub-contractors
 */
export const getAllSubContractors = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchSubContractorsQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await subContractorServices.getAllSubContractors(query);
  ServerResponse(res, true, 200, 'Sub-contractors retrieved successfully', result);
});

/**
 * Controller: Get a single sub-contractor by ID.
 * GET /api/v1/subContractor/get-sub-contractor/:subContractorId
 */
export const getSubContractorById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { subContractorId } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = req.query?.standAloneId as string;
  }

  const result = await subContractorServices.getSubContractorById(
    subContractorId as string,
    accessId
  );
  ServerResponse(res, true, 200, 'Sub-contractor retrieved successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// UPDATE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Update a sub-contractor.
 * PATCH /api/v1/subContractor/update-sub-contractor-by-manager/:subContractorId/:standAloneId  (TM)
 * PATCH /api/v1/subContractor/update-sub-contractor/:subContractorId  (Standalone)
 */
export const updateSubContractor = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const subContractorId = paramToString(req.params.subContractorId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  const result = await subContractorServices.updateSubContractor(
    subContractorId as string,
    req.body,
    accessId
  );
  ServerResponse(res, true, 200, 'Sub-contractor updated successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// DELETE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Delete a sub-contractor.
 * DELETE /api/v1/subContractor/delete-sub-contractor-by-manager/:subContractorId/:standAloneId  (TM)
 * DELETE /api/v1/subContractor/delete-sub-contractor/:subContractorId  (Standalone)
 */
export const deleteSubContractor = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const subContractorId = paramToString(req.params.subContractorId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  await subContractorServices.deleteSubContractor(subContractorId as string, accessId);
  ServerResponse(res, true, 200, 'Sub-contractor deleted successfully');
});
