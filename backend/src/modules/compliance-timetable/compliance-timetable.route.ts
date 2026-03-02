// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateComplianceTimetable,
  deleteComplianceTimetable,
  getComplianceTimetableById,
  getAllComplianceTimetable,
  createComplianceTimetableAsTransportManager,
  createComplianceTimetableAsStandAlone,
} from './compliance-timetable.controller';

//Import validation from corresponding module
import {
  validateCreateComplianceTimetableAsStandAlone,
  validateCreateComplianceTimetableAsTransportManager,
  validateDeleteComplianceTimetableIds,
  validateGetComplianceTimetableByIdParams,
  validateSearchComplianceTimetableQueries,
  validateUpdateComplianceTimetable,
  validateUpdateComplianceTimetableIds,
} from './compliance-timetable.validation';
import {
  validateId,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());


// Define route handlers
/**
 * @route POST /api/v1/compliance-timetable/create-as-manager
 * @description Create a new compliance-timetable
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateCreateComplianceTimetableAsTransportManager']
 * @param {function} controller - ['createComplianceTimetableAsTransportManager']
 */
router.post(
  '/create-as-manager',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateComplianceTimetableAsTransportManager,
  validateClientForManagerMiddleware,
  createComplianceTimetableAsTransportManager
);

/**
 * @route POST /api/v1/compliance-timetable/create-as-standalone
 * @description Create a new compliance-timetable as standalone user
 * @access Private (Stand Alone User)
 * @param {function} validation - ['validateCreateComplianceTimetableAsStandAlone']
 * @param {function} controller - ['createComplianceTimetableAsStandAlone']
 */
// router.post("/create-compliance-timetable/many", validateCreateManyComplianceTimetable, createManyComplianceTimetable);
router.post(
  '/create-as-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateComplianceTimetableAsStandAlone,
  createComplianceTimetableAsStandAlone
);

/**
 * @route PATCH /api/v1/vehicle/update-vehicle/:vehicleId/:standAloneId
 * @description Update a vehicle by ID (Transport Manager can only update vehicles of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateUpdateVehicleIds', 'validateUpdateVehicle']
 * @param {function} controller - ['updateVehicle']
 */

router.patch(
  '/update-as-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateUpdateComplianceTimetableIds,
  validateUpdateComplianceTimetable,
  updateComplianceTimetable
);

/**
 * @route PATCH /api/v1/vehicle/update-vehicle/:id
 * @description Update a vehicle by ID (Standalone User)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId', 'validateUpdateVehicle']
 * @param {function} controller - ['updateVehicle']
 */
router.patch(
  '/update-as-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateComplianceTimetable,
  updateComplianceTimetable
);

/**
 * @route DELETE /api/v1/compliance-timetable/:id/:standAloneId
 * @description Delete a compliance-timetable
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteComplianceTimetable']
 */
router.delete(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateDeleteComplianceTimetableIds,
  deleteComplianceTimetable
);

/**
 * @route DELETE /api/v1/compliance-timetable/:id
 * @description Delete a compliance-timetable
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteComplianceTimetable']
 */
router.delete(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteComplianceTimetable
);

/**
 * @route GET /api/v1/compliance-timetable/get-all
 * @description Get multiple compliance-timetables
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getAllComplianceTimetable']
 */
router.get(
  '/get-all',
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
      return validateSearchComplianceTimetableQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllComplianceTimetable
);

/**
 * @route GET /api/v1/compliance-timetable/:id/:standAloneId
 * @description Get a compliance-timetable by ID
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getComplianceTimetableById']
 */
router.get(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateGetComplianceTimetableByIdParams,
  getComplianceTimetableById
);

/**
 * @route GET /api/v1/compliance-timetable/:id
 * @description Get a compliance-timetable by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getComplianceTimetableById']
 */
router.get(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetComplianceTimetableByIdParams,
  getComplianceTimetableById
);

// Export the router
module.exports = router;

