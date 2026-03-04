// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createDriverTachograph,
  deleteDriverTachograph,
  getDriverTachographById,
  getManyDriverTachograph,
  updateDriverTachograph,
} from './driver-tachograph.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateDriverTachographAsManager,
  validateCreateDriverTachographAsStandAlone,
  validateDriverTachographAndManagerIdParam,
  validateDriverTachographIdParam,
  validateSearchDriverTachographQueries,
  validateUpdateDriverTachograph,
} from './driver-tachograph.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/driver-tachograph/create-driver-tachograph
 * @description Create a new driver-tachograph (Transport Manager)
 * @access Public
 * @param {function} validation - ['validateCreateDriverTachograph']
 * @param {function} controller - ['createDriverTachograph']
 */
router.post(
  '/create-driver-tachograph',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateDriverTachographAsManager,
  validateClientForManagerMiddleware,
  createDriverTachograph
);

/**
 * @route POST /api/v1/driver-tachograph/create-stand-alone-driver-tachograph
 * @description Create a new driver-tachograph (Standalone User)
 * @access Private (Standalone User)
 */
router.post(
  '/create-stand-alone-driver-tachograph',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateDriverTachographAsStandAlone,
  createDriverTachograph
);

/**
 * @route PATCH /api/v1/driver-tachograph/update-driver-tachograph/:id/:standAloneId
 * @description Update driver-tachograph information (Transport Manager)
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to update
 * @param {function} validation - ['validateId', 'validateUpdateDriverTachograph']
 * @param {function} controller - ['updateDriverTachograph']
 */
router.patch(
  '/update-driver-tachograph/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateDriverTachographAndManagerIdParam,
  validateUpdateDriverTachograph,
  updateDriverTachograph
);

/**
 * @route PATCH /api/v1/driver-tachograph/update-driver-tachograph/:id
 * @description Update driver-tachograph information (Standalone User)
 * @access Private (Standalone User)
 */
router.patch(
  '/update-driver-tachograph/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateDriverTachographIdParam,
  validateUpdateDriverTachograph,
  updateDriverTachograph
);

/**
 * @route DELETE /api/v1/driver-tachograph/delete-driver-tachograph/:id/:standAloneId
 * @description Delete a driver-tachograph (Transport Manager)
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteDriverTachograph']
 */
router.delete(
  '/delete-driver-tachograph/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateDriverTachographAndManagerIdParam,
  deleteDriverTachograph
);

/**
 * @route DELETE /api/v1/driver-tachograph/delete-driver-tachograph/:id
 * @description Delete a driver-tachograph (Standalone User)
 * @access Private (Standalone User)
 */
router.delete(
  '/delete-driver-tachograph/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateDriverTachographIdParam,
  deleteDriverTachograph
);

/**
 * @route GET /api/v1/driver-tachograph/get-driver-tachograph/many
 * @description Get multiple driver-tachographs
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyDriverTachograph']
 */
router.get(
  '/get-driver-tachograph/many',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(res, false, 400, 'standAloneId is not needed for standalone users');
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      if (!req.query?.standAloneId) {
        return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
      }
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchDriverTachographQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyDriverTachograph
);

/**
 * @route GET /api/v1/driver-tachograph/get-driver-tachograph/:id/:standAloneId
 * @description Get a driver-tachograph by ID (Transport Manager)
 * @access Private (Transport Manager)
 */
router.get(
  '/get-driver-tachograph/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateDriverTachographAndManagerIdParam,
  getDriverTachographById
);

/**
 * @route GET /api/v1/driver-tachograph/get-driver-tachograph/:id
 * @description Get a driver-tachograph by ID (Standalone User)
 * @access Private (Standalone User)
 */
router.get(
  '/get-driver-tachograph/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateDriverTachographIdParam,
  getDriverTachographById
);

// Export the router
module.exports = router;
