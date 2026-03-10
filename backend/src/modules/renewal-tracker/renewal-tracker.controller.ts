import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { renewalTrackerServices } from './renewal-tracker.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a single renewal-tracker.
 *
 * @param {Request} req - The request object containing renewal-tracker data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>>} - The created renewal-tracker.
 * @throws {Error} - Throws an error if the renewal-tracker creation fails.
 */
export const createRenewalTrackerAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await renewalTrackerServices.createRenewalTracker(req.body);
    if (!result) throw new Error('Failed to create renewal-tracker');
    ServerResponse(res, true, 201, 'Renewal-tracker created successfully', result);
  }
);

export const createRenewalTrackerAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await renewalTrackerServices.createRenewalTracker(req.body);
    if (!result) throw new Error('Failed to create renewal-tracker');
    ServerResponse(res, true, 201, 'Renewal-tracker created successfully', result);
  }
);

/**
 * Controller function to handle the creation of multiple renewal-trackers.
 *
 * @param {Request} req - The request object containing an array of renewal-tracker data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The created renewal-trackers.
 * @throws {Error} - Throws an error if the renewal-trackers creation fails.
 */
/**
 * Controller function to handle the update operation for a single renewal-tracker.
 *
 * @param {Request} req - The request object containing the ID of the renewal-tracker to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>>} - The updated renewal-tracker.
 * @throws {Error} - Throws an error if the renewal-tracker update fails.
 */
export const updateRenewalTracker = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  const result = await renewalTrackerServices.updateRenewalTracker(
    id as string,
    req.body,
    req.user!._id,
    standAloneId as string | undefined
  );

  if (!result) {
    return ServerResponse(res, false, 404, 'Renewal-tracker not found or access denied');
  }

  ServerResponse(res, true, 200, 'Renewal-tracker updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple renewal-trackers.
 *
 * @param {Request} req - The request object containing an array of renewal-tracker data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The updated renewal-trackers.
 * @throws {Error} - Throws an error if the renewal-trackers update fails.
 */
/**
 * Controller function to handle the deletion of a single renewal-tracker.
 *
 * @param {Request} req - The request object containing the ID of the renewal-tracker to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>>} - The deleted renewal-tracker.
 * @throws {Error} - Throws an error if the renewal-tracker deletion fails.
 */
export const deleteRenewalTracker = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  const result = await renewalTrackerServices.deleteRenewalTracker(
    id as string,
    req.user!._id,
    standAloneId
  );
  if (!result) {
    return ServerResponse(res, false, 404, 'Renewal-tracker not found or access denied');
  }
  ServerResponse(res, true, 200, 'Renewal-tracker deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple renewal-trackers.
 *
 * @param {Request} req - The request object containing an array of IDs of renewal-tracker to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The deleted renewal-trackers.
 * @throws {Error} - Throws an error if the renewal-tracker deletion fails.
 */
/**
 * Controller function to handle the retrieval of a single renewal-tracker by ID.
 *
 * @param {Request} req - The request object containing the ID of the renewal-tracker to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>>} - The retrieved renewal-tracker.
 * @throws {Error} - Throws an error if the renewal-tracker retrieval fails.
 */
export const getRenewalTrackerById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const renewalTrackerId = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    if (req.user?.role === UserRole.TRANSPORT_MANAGER && !standAloneId) {
      return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
    }

    const result = await renewalTrackerServices.getRenewalTrackerById(renewalTrackerId as string, {
      requesterId: req.user!._id,
      requesterRole: req.user!.role,
      standAloneId,
    });
    if (!result) throw new Error('Renewal-tracker not found');
    ServerResponse(res, true, 200, 'Renewal-tracker retrieved successfully', result);
  }
);

/**
 * Controller function to handle the retrieval of multiple renewal-trackers.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The retrieved renewal-trackers.
 * @throws {Error} - Throws an error if the renewal-trackers retrieval fails.
 */
export const getManyRenewalTracker = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = {
      ...((req as any).validatedQuery as SearchQueryInput),
      requesterId: req.user?._id,
      requesterRole: req.user?.role,
    } as any;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    const { renewalTrackers, totalData, totalPages } =
      await renewalTrackerServices.getManyRenewalTracker(query);
    if (!renewalTrackers) throw new Error('Failed to retrieve renewal-trackers');
    ServerResponse(res, true, 200, 'Renewal-trackers retrieved successfully', {
      renewalTrackers,
      totalData,
      totalPages,
    });
  }
);
