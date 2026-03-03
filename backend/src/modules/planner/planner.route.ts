// Import Router from express
import { Router } from 'express';

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
  validateUpdatePlanner,
} from './planner.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';

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
router.get('/get-planner/many', validateSearchQueries, getManyPlanner);

/**
 * @route GET /api/v1/planner/get-planner/:id
 * @description Get a planner by ID
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPlannerById']
 */
router.get('/get-planner/:id', validateId, getPlannerById);

// Export the router
module.exports = router;

