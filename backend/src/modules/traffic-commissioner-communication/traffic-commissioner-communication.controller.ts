import { Response } from 'express';
import { trafficCommissionerCommunicationServices } from './traffic-commissioner-communication.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import { SearchTrafficCommissionerCommunicationQueryInput } from './traffic-commissioner-communication.validation';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a communication by a transport manager.
 *
 * @param {Request} req - The request object containing communication data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created communication.
 * @throws {Error} - Throws an error if the communication creation fails.
 */
export const createCommunicationAsTransportManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    // Call the service method to create a new communication and get the result
    const result =
      await trafficCommissionerCommunicationServices.createTrafficCommissionerCommunicationAsTransportManager(
        req.body
      );
    if (!result) throw new Error('Failed to create communication');
    // Send a success response with the created communication data
    ServerResponse(res, true, 201, 'Communication created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a stand-alone communication.
 *
 * @param {Request} req - The request object containing communication data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created communication.
 * @throws {Error} - Throws an error if the communication creation fails.
 */
export const createCommunicationAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new stand-alone communication and get the result
    const result =
      await trafficCommissionerCommunicationServices.createTrafficCommissionerCommunicationAsStandAlone(
        req.body
      );
    if (!result) throw new Error('Failed to create stand-alone communication');
    // Send a success response with the created communication data
    ServerResponse(res, true, 201, 'Communication created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single traffic-commissioner-communication.
 *
 * @param {Request} req - The request object containing the ID of the traffic-commissioner-communication to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The updated traffic-commissioner-communication.
 * @throws {Error} - Throws an error if the traffic-commissioner-communication update fails.
 */
export const updateTrafficCommissionerCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    // Call the service method to update the traffic-commissioner-communication by ID and get the result
    const result =
      await trafficCommissionerCommunicationServices.updateTrafficCommissionerCommunication(
        id as string,
        req.body,
        req.user!._id,
        standAloneId
      );
    if (!result) throw new Error('Traffic-commissioner-communication not found or access denied');
    // Send a success response with the updated traffic-commissioner-communication data
    ServerResponse(
      res,
      true,
      200,
      'Traffic-commissioner-communication updated successfully',
      result
    );
  }
);

/**
 * Controller function to handle the deletion of a single traffic-commissioner-communication.
 *
 * @param {Request} req - The request object containing the ID of the traffic-commissioner-communication to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The deleted traffic-commissioner-communication.
 * @throws {Error} - Throws an error if the traffic-commissioner-communication deletion fails.
 */
export const deleteTrafficCommissionerCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    // Call the service method to delete the traffic-commissioner-communication by ID
    const result =
      await trafficCommissionerCommunicationServices.deleteTrafficCommissionerCommunication(
        id as string,
        req.user!._id,
        standAloneId
      );
    if (!result) throw new Error('Traffic-commissioner-communication not found or access denied');
    // Send a success response confirming the deletion
    ServerResponse(res, true, 200, 'Traffic-commissioner-communication deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single traffic-commissioner-communication by ID.
 *
 * @param {Request} req - The request object containing the ID of the traffic-commissioner-communication to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The retrieved traffic-commissioner-communication.
 * @throws {Error} - Throws an error if the traffic-commissioner-communication retrieval fails.
 */
export const getTrafficCommissionerCommunicationById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);

    const standAloneId =
      req.user?.role === UserRole.TRANSPORT_MANAGER
        ? paramToString((req.params as any).standAloneId) ||
          (req.query?.standAloneId as string | undefined)
        : undefined;

    if (req.user?.role === UserRole.TRANSPORT_MANAGER && !standAloneId) {
      throw new Error('standAloneId is required for transport managers');
    }

    // Call the service method to get the traffic-commissioner-communication by ID and get the result
    const result =
      await trafficCommissionerCommunicationServices.getTrafficCommissionerCommunicationById(
        id as string,
        {
          requesterId: req.user!._id,
          requesterRole: req.user!.role,
          standAloneId,
        }
      );
    if (!result) throw new Error('Traffic-commissioner-communication not found');
    // Send a success response with the retrieved resource data
    ServerResponse(
      res,
      true,
      200,
      'Traffic-commissioner-communication retrieved successfully',
      result
    );
  }
);

/**
 * Controller function to handle the retrieval of multiple traffic-commissioner-communications.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>[]>} - The retrieved traffic-commissioner-communications.
 * @throws {Error} - Throws an error if the traffic-commissioner-communications retrieval fails.
 */
export const getManyTrafficCommissionerCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the validated and transformed query from Zod middleware
    const query = {
      ...((req as any).validatedQuery as SearchTrafficCommissionerCommunicationQueryInput),
    } as SearchQueryInput & { standAloneId?: string; requesterId?: string; requesterRole?: string };

    query.requesterId = req.user!._id;
    query.requesterRole = req.user!.role;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    // Call the service method to get multiple traffic-commissioner-communications based on query parameters and get the result
    const { trafficCommissionerCommunications, totalData, totalPages } =
      await trafficCommissionerCommunicationServices.getManyTrafficCommissionerCommunication(query);
    if (!trafficCommissionerCommunications)
      throw new Error('Failed to retrieve traffic-commissioner-communications');
    // Send a success response with the retrieved traffic-commissioner-communications data
    ServerResponse(res, true, 200, 'Traffic-commissioner-communications retrieved successfully', {
      communications: trafficCommissionerCommunications,
      totalData,
      totalPages,
    });
  }
);
