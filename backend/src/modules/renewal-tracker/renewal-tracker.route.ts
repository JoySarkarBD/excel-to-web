// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createRenewalTrackerAsManager,
  createRenewalTrackerAsStandAlone,
  deleteRenewalTracker,
  getManyRenewalTracker,
  getRenewalTrackerById,
  updateRenewalTracker,
} from './renewal-tracker.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateRenewalTrackerAsManager,
  validateCreateRenewalTrackerAsStandAlone,
  validateRenewalTrackerAndManagerIdParam,
  validateRenewalTrackerIdParam,
  validateSearchRenewalTrackerQueries,
  validateUpdateRenewalTracker,
} from './renewal-tracker.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/renewal-tracker/create-renewal-tracker
 * @description Create a new renewal-tracker as transport manager
 * @access Public
 * @param {function} validation - ['validateCreateRenewalTracker']
 * @param {function} controller - ['createRenewalTracker']
 */
router.post(
  '/create-renewal-tracker',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateRenewalTrackerAsManager,
  validateClientForManagerMiddleware,
  createRenewalTrackerAsManager
);

/**
 * @route POST /api/v1/renewal-tracker/create-stand-alone-renewal-tracker
 * @description Create a new renewal-tracker as stand-alone user
 * @access Public
 * @param {function} validation - ['validateCreateRenewalTrackerAsStandAlone']
 * @param {function} controller - ['createRenewalTrackerAsStandAlone']
 */
router.post(
  '/create-stand-alone-renewal-tracker',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateRenewalTrackerAsStandAlone,
  createRenewalTrackerAsStandAlone
);

/**
 * @route PATCH /api/v1/renewal-tracker/update-renewal-tracker/:id/:standAloneId
 * @description Update renewal-tracker information
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to update
 * @param {function} validation - ['validateRenewalTrackerAndManagerIdParam', 'validateUpdateRenewalTracker']
 * @param {function} controller - ['updateRenewalTracker']
 */
router.patch(
  '/update-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRenewalTrackerAndManagerIdParam,
  validateUpdateRenewalTracker,
  updateRenewalTracker
);

/**
 * @route PATCH /api/v1/renewal-tracker/update-renewal-tracker/:id
 * @description Update renewal-tracker information as stand-alone user
 * @access Private (Stand-alone User)
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to update
 * @param {function} validation - ['validateRenewalTrackerIdParam', 'validateUpdateRenewalTracker']
 * @param {function} controller - ['updateRenewalTracker']
 */
router.patch(
  '/update-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRenewalTrackerIdParam,
  validateUpdateRenewalTracker,
  updateRenewalTracker
);

/**
 * @route DELETE /api/v1/renewal-tracker/delete-renewal-tracker/:id/:standAloneId
 * @description Delete a renewal-tracker as transport manager
 * @access Private (Transport Manager)
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to delete
 * @param {function} validation - ['validateRenewalTrackerAndManagerIdParam']
 * @param {function} controller - ['deleteRenewalTracker']
 */
router.delete(
  '/delete-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRenewalTrackerAndManagerIdParam,
  deleteRenewalTracker
);

/**
 * @route DELETE /api/v1/renewal-tracker/delete-renewal-tracker/:id
 * @description Delete a renewal-tracker as stand-alone user
 * @access Private (Stand-alone User)
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to delete
 * @param {function} validation - ['validateRenewalTrackerIdParam']
 * @param {function} controller - ['deleteRenewalTracker']
 */
router.delete(
  '/delete-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRenewalTrackerIdParam,
  deleteRenewalTracker
);

/**
 * @route GET /api/v1/renewal-tracker/get-renewal-tracker/many
 * @description Get multiple renewal-trackers based on role
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyRenewalTracker']
 */
router.get(
  '/get-renewal-tracker/many',
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
      return validateSearchRenewalTrackerQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyRenewalTracker
);

/**
 * @route GET /api/v1/renewal-tracker/get-renewal-tracker/:id/:standAloneId
 * @description Get a renewal-tracker by ID as transport manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getRenewalTrackerById']
 */
router.get(
  '/get-renewal-tracker/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateRenewalTrackerAndManagerIdParam,
  getRenewalTrackerById
);

/**
 * @route GET /api/v1/renewal-tracker/get-renewal-tracker/:id
 * @description Get a renewal-tracker by ID as stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getRenewalTrackerById']
 */
router.get(
  '/get-renewal-tracker/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateRenewalTrackerIdParam,
  getRenewalTrackerById
);

// Export the router
module.exports = router;
