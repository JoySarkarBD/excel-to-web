import { Response } from 'express';
import mongoose from 'mongoose';
import { pg9AndPg13PlanServices } from './pg9AndPg13Plan.service';
import {
  CreatePg9AndPg13PlanAsManagerInput,
  CreatePg9AndPg13PlanAsStandAloneInput,
  UpdatePg9AndPg13PlanInput,
  SearchPg9AndPg13PlansQueryInput,
} from './pg9AndPg13Plan.validation';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';

/** Helper: extract a route param as a string. */
const paramToString = (val: string | Record<string, string>): string =>
  typeof val === 'object' ? String(Object.values(val)[0]) : String(val);

/**
 * Create a PG9 & PG13 plan as a Transport Manager.
 * Requires standAloneId to link to the standalone user's vehicle.
 * @param data - The input data for creating the plan, including createdBy and standAloneId.
 */
export const createPg9AndPg13PlanAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as CreatePg9AndPg13PlanAsManagerInput;
  const createdBy = new mongoose.Types.ObjectId(req.user!._id);
  const result = await pg9AndPg13PlanServices.createPg9AndPg13PlanAsManager({ ...body, createdBy });
  ServerResponse(res, true, 201, 'PG9 & PG13 plan created successfully', result);
});

/**
 * Create a PG9 & PG13 plan as a Standalone User.
 * No standAloneId needed since createdBy is the standalone user.
 * @param data - The input data for creating the plan, including createdBy.
 */
export const createPg9AndPg13PlanAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as CreatePg9AndPg13PlanAsStandAloneInput;
  const createdBy = new mongoose.Types.ObjectId(req.user!._id);
  const result = await pg9AndPg13PlanServices.createPg9AndPg13PlanAsStandAlone({ ...body, createdBy });
  ServerResponse(res, true, 201, 'PG9 & PG13 plan created successfully', result);
});

/**
 * Get all PG9 & PG13 plans (TM route — standAloneId from query).
 * Uses pagination and search query params, with access control via standAloneId.
 */
export const getAllPg9AndPg13PlansAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = (req as any).validatedQuery as SearchPg9AndPg13PlansQueryInput;
  const { pg9AndPg13Plans, totalData, totalPages } =
    await pg9AndPg13PlanServices.getAllPg9AndPg13Plans(query);
  ServerResponse(res, true, 200, 'PG9 & PG13 plans retrieved successfully', {
    pg9AndPg13Plans,
    totalData,
    totalPages,
  });
});

/**
 * Get all PG9 & PG13 plans (Standalone route — accessId from token).
 * Uses pagination and search query params, with access control via standAloneId = userId.
 * TM users should use the other route with standAloneId in query params.
 * Standalone users will only get their own plans since standAloneId = userId.
 * TM users can get any standalone user's plans by providing the standAloneId in query params.
 */
export const getAllPg9AndPg13PlansAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = (req as any).validatedQuery as SearchPg9AndPg13PlansQueryInput;
  const standAloneId = req.user!._id;
  const { pg9AndPg13Plans, totalData, totalPages } =
    await pg9AndPg13PlanServices.getAllPg9AndPg13Plans({ ...query, standAloneId });
  ServerResponse(res, true, 200, 'PG9 & PG13 plans retrieved successfully', {
    pg9AndPg13Plans,
    totalData,
    totalPages,
  });
});

/**
 * Get a single PG9 & PG13 plan by ID (TM route — standAloneId from params).
 * Access control via standAloneId in params, which is the standalone user's ID.
 * TM users can access plans for a specific standalone user by providing their standAloneId.
 * Standalone users should use the other route which gets the accessId from the token.
 */
export const getPg9AndPg13PlanByIdAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const standAloneId = paramToString(req.params.standAloneId);
  const result = await pg9AndPg13PlanServices.getPg9AndPg13PlanById(pg9AndPg13PlanId, standAloneId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan retrieved successfully', result);
});

/**
 * Get a single PG9 & PG13 plan by ID (Standalone route — accessId from token).
 * Access control via standAloneId = userId from token, so users can only access their own plans.
 * TM users should use the other route which requires standAloneId in params to access a specific user's plans.
 */
export const getPg9AndPg13PlanByIdAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const accessId = req.user!._id;
  const result = await pg9AndPg13PlanServices.getPg9AndPg13PlanById(pg9AndPg13PlanId, accessId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan retrieved successfully', result);
});

/**
 * Update a PG9 & PG13 plan as a Transport Manager.
 * Uses $or access control on createdBy / standAloneId, with standAloneId from params.
 * If vehicleId changes, re-verify ownership.
 * TM users can update plans for a specific standalone user by providing their standAloneId.
 * Standalone users should use the other route which gets the accessId from the token.
 */
export const updatePg9AndPg13PlanAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const standAloneId = paramToString(req.params.standAloneId);
  const body = req.body as UpdatePg9AndPg13PlanInput;
  const result = await pg9AndPg13PlanServices.updatePg9AndPg13Plan(pg9AndPg13PlanId, body, standAloneId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan updated successfully', result);
});

/**
 * Update a PG9 & PG13 plan as a Standalone User.
 * Uses $or access control on createdBy / standAloneId, with accessId from token.
 * If vehicleId changes, re-verify ownership.
 * Standalone users can only update their own plans since accessId = userId from token.
 * TM users should use the other route which requires standAloneId in params to update a specific user's plans.
 */
export const updatePg9AndPg13PlanAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const accessId = req.user!._id;
  const body = req.body as UpdatePg9AndPg13PlanInput;
  const result = await pg9AndPg13PlanServices.updatePg9AndPg13Plan(pg9AndPg13PlanId, body, accessId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan updated successfully', result);
});

/**
 * Delete a PG9 & PG13 plan as a Transport Manager.
 * Uses $or access control on createdBy / standAloneId, with standAloneId from params.
 * TM users can delete plans for a specific standalone user by providing their standAloneId.
 * Standalone users should use the other route which gets the accessId from the token.
 */
export const deletePg9AndPg13PlanAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const standAloneId = paramToString(req.params.standAloneId);
  await pg9AndPg13PlanServices.deletePg9AndPg13Plan(pg9AndPg13PlanId, standAloneId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan deleted successfully');
});

/**
 * Delete a PG9 & PG13 plan as a Standalone User.
 * Uses $or access control on createdBy / standAloneId, with accessId from token.
 * Standalone users can only delete their own plans since accessId = userId from token.
 * TM users should use the other route which requires standAloneId in params to delete a specific user's plans.
 */
export const deletePg9AndPg13PlanAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const pg9AndPg13PlanId = paramToString(req.params.pg9AndPg13PlanId);
  const accessId = req.user!._id;
  await pg9AndPg13PlanServices.deletePg9AndPg13Plan(pg9AndPg13PlanId, accessId);
  ServerResponse(res, true, 200, 'PG9 & PG13 plan deleted successfully');
});