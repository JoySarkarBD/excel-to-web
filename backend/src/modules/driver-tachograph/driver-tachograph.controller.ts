import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { driverTachographServices } from './driver-tachograph.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a single driver-tachograph as transport manager.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing driver-tachograph data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>>} - The created driver-tachograph.
 * @throws {Error} - Throws an error if the driver-tachograph creation fails.
 */
export const createDriverTachographAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // ensure standAloneId is converted to ObjectId
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    // Call the service method to create a new driver-tachograph and get the result
    const result = await driverTachographServices.createDriverTachographAsManager(req.body);
    if (!result) throw new Error('Failed to create driver-tachograph');
    // Send a success response with the created driver-tachograph data
    ServerResponse(res, true, 201, 'Driver-tachograph created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a single driver-tachograph as standalone user.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing driver-tachograph data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>>} - The created driver-tachograph.
 * @throws {Error} - Throws an error if the driver-tachograph creation fails.
 */
export const createDriverTachographAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new driver-tachograph and get the result
    const result = await driverTachographServices.createDriverTachographAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create driver-tachograph');
    // Send a success response with the created driver-tachograph data
    ServerResponse(res, true, 201, 'Driver-tachograph created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single driver-tachograph.
 *
 * @param {Request} req - The request object containing the ID of the driver-tachograph to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>>} - The updated driver-tachograph.
 * @throws {Error} - Throws an error if the driver-tachograph update fails.
 */
export const updateDriverTachograph = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    if (req.user?._id) {
      req.body.reviewedBy = req.user._id;
    }
    // Call the service method to update the driver-tachograph by ID and get the result
    const result = await driverTachographServices.updateDriverTachograph(
      id as string,
      req.body,
      req.user!._id,
      standAloneId as string | undefined
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Driver-tachograph not found or access denied');
    }
    // Send a success response with the updated driver-tachograph data
    ServerResponse(res, true, 200, 'Driver-tachograph updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single driver-tachograph.
 *
 * @param {Request} req - The request object containing the ID of the driver-tachograph to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>>} - The deleted driver-tachograph.
 * @throws {Error} - Throws an error if the driver-tachograph deletion fails.
 */
export const deleteDriverTachograph = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);
    // Call the service method to delete the driver-tachograph by ID
    const result = await driverTachographServices.deleteDriverTachograph(
      id as string,
      req.user!._id,
      standAloneId
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Driver-tachograph not found or access denied');
    }
    // Send a success response confirming the deletion
    ServerResponse(res, true, 200, 'Driver-tachograph deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single driver-tachograph by ID.
 *
 * @param {Request} req - The request object containing the ID of the driver-tachograph to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>>} - The retrieved driver-tachograph.
 * @throws {Error} - Throws an error if the driver-tachograph retrieval fails.
 */
export const getDriverTachographById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the driver-tachograph by ID and get the result
  const result = await driverTachographServices.getDriverTachographById(id as string);
  if (!result) throw new Error('Driver-tachograph not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Driver-tachograph retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple driver-tachographs.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriverTachograph>[]>} - The retrieved driver-tachographs.
 * @throws {Error} - Throws an error if the driver-tachographs retrieval fails.
 */
export const getManyDriverTachograph = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the validated and transformed query from Zod middleware
    const query = {
      ...((req as any).validatedQuery as SearchQueryInput),
      requesterId: req.user?._id,
      requesterRole: req.user?.role,
    } as any;

    // For standalone users, always restrict to own scope
    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    // For transport managers, standAloneId from query is optional and handled in service
    // Call the service method to get multiple driver-tachographs based on query parameters and get the result
    const { driverTachographs, totalData, totalPages } =
      await driverTachographServices.getManyDriverTachograph(query);
    if (!driverTachographs) throw new Error('Failed to retrieve driver-tachographs');
    // Send a success response with the retrieved driver-tachographs data
    ServerResponse(res, true, 200, 'Driver-tachographs retrieved successfully', {
      driverTachographs,
      totalData,
      totalPages,
    });
  }
);
