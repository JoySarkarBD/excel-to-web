// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createVehicleAsStandAlone,
  createVehicleAsTransportManager,
  deleteVehicle,
  getManyVehicle,
  getVehicleById,
  updateVehicle,
} from './vehicle.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateVehicleAsStandAlone,
  validateCreateVehicleAsTransportManager,
  validateDeleteVehicle,
  validateGetVehicleByIdParams,
  validateSearchVehicleQueries,
  validateUpdateVehicle,
  validateUpdateVehicleIds,
} from './vehicle.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-vehicle
 * @description Create a new vehicle as a transport manager
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */
router.post(
  '/create-vehicle',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateVehicleAsTransportManager,
  validateClientForManagerMiddleware,
  createVehicleAsTransportManager
);

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-stand-alone-vehicle
 * @description Create a new stand-alone vehicle
 * @access Private (Standalone User)
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */
router.post(
  '/create-stand-alone-vehicle',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateVehicleAsStandAlone,
  createVehicleAsStandAlone
);

/**
 * @route PATCH /api/v1/vehicle/update-vehicle/:vehicleId/:standAloneId
 * @description Update a vehicle by ID (Transport Manager can only update vehicles of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateUpdateVehicleIds', 'validateUpdateVehicle']
 * @param {function} controller - ['updateVehicle']
 */

router.patch(
  '/update-vehicle/:vehicleId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateUpdateVehicleIds,
  validateUpdateVehicle,
  updateVehicle
);

/**
 * @route PATCH /api/v1/vehicle/update-vehicle/:id
 * @description Update a vehicle by ID (Standalone User)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId', 'validateUpdateVehicle']
 * @param {function} controller - ['updateVehicle']
 */
router.patch(
  '/update-vehicle/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateVehicle,
  updateVehicle
);

/**
 * @route DELETE /api/v1/vehicle/delete-vehicle/:id
 * @description Delete a vehicle
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteVehicle']
 */
router.delete(
  '/delete-vehicle/:vehicleId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateDeleteVehicle,
  deleteVehicle
);

router.delete(
  '/delete-vehicle/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteVehicle
);

/**
 * @route GET /api/v1/vehicle/get-vehicle/many
 * @description Get multiple vehicles
 * @access Private (Transport Manager or Standalone User)
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyVehicle']
 */
router.get(
  '/get-vehicle/many',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(
        res,
        false,
        403,
        'Forbidden: standAloneId is only allowed for transport managers'
      );
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchVehicleQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyVehicle
);

/**
 * @route GET /api/v1/vehicle/get-vehicle/:id
 * @description Get a vehicle by ID
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getVehicleById']
 */
router.get(
  '/get-vehicle/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateGetVehicleByIdParams,
  getVehicleById
);

/**
 * @route GET /api/v1/vehicle/get-vehicle/:id
 * @description Get a vehicle as stand alone user by ID
 * @access Private (Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getVehicleById']
 */
router.get(
  '/get-vehicle/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetVehicleByIdParams,
  getVehicleById
);

// Export the router
module.exports = router;
