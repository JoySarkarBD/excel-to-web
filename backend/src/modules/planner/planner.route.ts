// Import Router from express
import { NextFunction, Router, Response } from 'express';

// Import controller from corresponding module
import {
  updatePlanner,
  deletePlanner,
  getPlannerById,
  getManyPlanner,
  createPlannerAsManager,
  createPlannerAsStandAlone,
} from './planner.controller';

//Import validation from corresponding module
import {
  validateCreatePlannerAsManager,
  validateCreatePlannerAsStandAlone,
  validateIdParam,
  validateIdAndManagerParam,
  validateUpdatePlanner,
} from './planner.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import { validateSearchPlannerQueries } from './planner.validation';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * Create Planner as Transport Manager
 *
 * @route POST /api/v1/planner/create-planner
 * @description Create a new planner as Transport Manager
 * @access Private
 * @param {function} validation - ['validateCreatePlannerAsManager']
 * @param {function} controller - ['createPlannerAsManager']
 */
router.post(
  '/create-planner',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreatePlannerAsManager,
  validateClientForManagerMiddleware,
  createPlannerAsManager
);

/**
 * Create Planner as Standalone User
 *
 * @route POST /api/v1/planner/create-planner-standalone
 * @description Create a new planner as Standalone User
 * @access Private
 * @param {function} validation - ['validateCreatePlannerAsStandAlone']
 * @param {function} controller - ['createPlannerAsStandAlone']
 */
router.post(
  '/create-planner-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreatePlannerAsStandAlone,
  createPlannerAsStandAlone
);

/**
 * @route PUT /api/v1/planner/update-planner/:id
 * @description Update planner information
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update
 * @param {function} validation - ['validateId', 'validateUpdatePlanner']
 * @param {function} controller - ['updatePlanner']
 */
router.put('/update-planner/:id', validateId, validateUpdatePlanner, updatePlanner);

/**
 * @route DELETE /api/v1/planner/delete-planner/:id
 * @description Delete a planner
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deletePlanner']
 */
router.delete('/delete-planner/:id', validateId, deletePlanner);

/**
 * @route GET /api/v1/planner/get-planner/many
 * @description Get multiple planners
 * @access Private
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyPlanner']
 */
router.get(
  '/get-planner/many',
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
      return validateSearchPlannerQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyPlanner
);

/**
 * Get a planner by ID as Transport Manager
 *
 * @route GET /api/v1/planner/get-planner/:id/:standAloneId
 * @description Get a planner by ID as Transport Manager
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPlannerById']
 */
router.get(
  '/get-planner/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateIdAndManagerParam,
  getPlannerById
);

/**
 * Get a planner by ID as Standalone User
 *
 * @route GET /api/v1/planner/get-planner/:id
 * @description Get a planner by ID as Standalone User
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPlannerById']
 */
router.get(
  '/get-planner/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateIdParam,
  getPlannerById
);

// Export the router
module.exports = router;

