// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createOcrsPlanAsManager,
  createOcrsPlanAsStandAlone,
  deleteOcrsPlan,
  getManyOcrsPlan,
  getOcrsPlanById,
  updateOcrsPlan,
} from './ocrs-plan.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateOcrsPlanAsManager,
  validateCreateOcrsPlanAsStandAlone,
  validateOcrsPlanAndManagerIdParam,
  validateOcrsPlanIdParam,
  validateSearchOcrsPlanQueries,
  validateUpdateOcrsPlan,
} from './ocrs-plan.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/ocrs-plan/create-ocrs-plan
 * @description Create a new ocrs-plan as transport manager
 * @access Public
 * @param {function} validation - ['validateCreateOcrsPlan']
 * @param {function} controller - ['createOcrsPlan']
 */
router.post(
  '/create-ocrs-plan',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateOcrsPlanAsManager,
  validateClientForManagerMiddleware,
  createOcrsPlanAsManager
);

/**
 * @route POST /api/v1/ocrs-plan/create-stand-alone-ocrs-plan
 * @description Create a new ocrs-plan as stand-alone user
 * @access Public
 * @param {function} validation - ['validateCreateOcrsPlanAsStandAlone']
 * @param {function} controller - ['createOcrsPlanAsStandAlone']
 */
router.post(
  '/create-stand-alone-ocrs-plan',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateOcrsPlanAsStandAlone,
  createOcrsPlanAsStandAlone
);

/**
 * @route PATCH /api/v1/ocrs-plan/update-ocrs-plan/:id/:standAloneId
 * @description Update ocrs-plan information as transport manager
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to update
 * @param {function} validation - ['validateOcrsPlanAndManagerIdParam', 'validateUpdateOcrsPlan']
 * @param {function} controller - ['updateOcrsPlan']
 */
router.patch(
  '/update-ocrs-plan/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateOcrsPlanAndManagerIdParam,
  validateUpdateOcrsPlan,
  updateOcrsPlan
);

/**
 * @route PATCH /api/v1/ocrs-plan/update-ocrs-plan/:id
 * @description Update ocrs-plan information as stand-alone user
 * @access Private (Stand-alone User)
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to update
 * @param {function} validation - ['validateOcrsPlanIdParam', 'validateUpdateOcrsPlan']
 * @param {function} controller - ['updateOcrsPlan']
 */
router.patch(
  '/update-ocrs-plan/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateOcrsPlanIdParam,
  validateUpdateOcrsPlan,
  updateOcrsPlan
);

/**
 * @route DELETE /api/v1/ocrs-plan/delete-ocrs-plan/:id/:standAloneId
 * @description Delete a ocrs-plan as transport manager
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to delete
 * @param {function} validation - ['validateOcrsPlanAndManagerIdParam']
 * @param {function} controller - ['deleteOcrsPlan']
 */
router.delete(
  '/delete-ocrs-plan/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateOcrsPlanAndManagerIdParam,
  deleteOcrsPlan
);

/**
 * @route DELETE /api/v1/ocrs-plan/delete-ocrs-plan/:id
 * @description Delete a ocrs-plan as stand-alone user
 * @access Private (Stand-alone User)
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to delete
 * @param {function} validation - ['validateOcrsPlanIdParam']
 * @param {function} controller - ['deleteOcrsPlan']
 */
router.delete(
  '/delete-ocrs-plan/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateOcrsPlanIdParam,
  deleteOcrsPlan
);

/**
 * @route GET /api/v1/ocrs-plan/get-ocrs-plan/many
 * @description Get multiple ocrs-plans
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyOcrsPlan']
 */
router.get(
  '/get-ocrs-plan/many',
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
      return validateSearchOcrsPlanQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyOcrsPlan
);

/**
 * @route GET /api/v1/ocrs-plan/get-ocrs-plan/:id/:standAloneId
 * @description Get a ocrs-plan by ID as transport manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getOcrsPlanById']
 */
router.get(
  '/get-ocrs-plan/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateOcrsPlanAndManagerIdParam,
  getOcrsPlanById
);

/**
 * @route GET /api/v1/ocrs-plan/get-ocrs-plan/:id
 * @description Get a ocrs-plan by ID as stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getOcrsPlanById']
 */
router.get(
  '/get-ocrs-plan/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateOcrsPlanIdParam,
  getOcrsPlanById
);

// Export the router
module.exports = router;
