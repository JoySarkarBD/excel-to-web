// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createSpotCheckAsManager,
  createSpotCheckAsStandAlone,
  deleteSpotCheck,
  getManySpotCheck,
  getSpotCheckById,
  updateSpotCheck,
} from './spot-check.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateSpotCheckAsManager,
  validateCreateSpotCheckAsStandAlone,
  validateSearchSpotChecksQueries,
  validateSpotCheckAndManagerIdParam,
  validateUpdateSpotCheck,
} from './spot-check.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/spot-check/create-spot-check
 * @description Create a new spot-check (Transport Manager)
 * @access Private (Transport Manager)
 */
router.post(
  '/create-spot-check',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateSpotCheckAsManager,
  validateClientForManagerMiddleware,
  createSpotCheckAsManager
);

/**
 * @route POST /api/v1/spot-check/create-stand-alone-spot-check
 * @description Create a new spot-check (Standalone User)
 * @access Private (Standalone User)
 */
router.post(
  '/create-stand-alone-spot-check',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateSpotCheckAsStandAlone,
  createSpotCheckAsStandAlone
);

/**
 * @route PATCH /api/v1/spot-check/update-spot-check/:id/:standAloneId
 * @description Update spot-check information (Transport Manager - includes standAloneId for additional Transport Manager filter)
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to update
 * @param {function} validation - ['validateId', 'validateUpdateSpotCheck']
 * @param {function} controller - ['updateSpotCheck']
 */
router.patch(
  '/update-spot-check/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSpotCheckAndManagerIdParam,
  validateUpdateSpotCheck,
  updateSpotCheck
);

/**
 * @route PATCH /api/v1/spot-check/update-spot-check/:id
 * @description Update spot-check information (Standalone User)
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to update
 * @param {function} validation - ['validateId', 'validateUpdateSpotCheck']
 * @param {function} controller - ['updateSpotCheck']
 */
router.patch(
  '/update-spot-check/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateSpotCheck,
  updateSpotCheck
);

/**
 * @route DELETE /api/v1/spot-check/delete-spot-check/:id/:standAloneId
 * @description Delete a spot-check (Transport Manager - includes standAloneId for additional Transport Manager filter)
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSpotCheck']
 */
router.delete(
  '/delete-spot-check/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSpotCheckAndManagerIdParam,
  deleteSpotCheck
);

/**
 * @route DELETE /api/v1/spot-check/delete-spot-check/:id
 * @description Delete a spot-check (Standalone User)
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSpotCheck']
 */
router.delete(
  '/delete-spot-check/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteSpotCheck
);

/**
 * @route GET /api/v1/spot-check/get-spot-check/many
 * @description Get multiple spot-checks for Transport Manager (includes standAloneId for additional Transport Manager filter)
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySpotCheck']
 */
router.get(
  '/get-spot-check/many',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(
        res,
        false,
        403,
        'Forbidden: standAloneId is only allowed for transport managers'
      );
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER)
      return validateClientForManagerMiddleware(req, res, next);
    next();
  },
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER)
      return validateSearchSpotChecksQueries(req, res, next);
    return validateSearchQueries(req, res, next);
  },
  getManySpotCheck
);

/**
 * @route GET /api/v1/spot-check/get-spot-check/:spotCheckId/:standAloneId
 * @description Get a spot-check by ID for Transport Manager (includes standAloneId for additional Transport Manager filter)
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSpotCheckById']
 */
router.get(
  '/get-spot-check/:id',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Standalone users must NOT supply standAloneId
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(
        res,
        false,
        403,
        'Forbidden: standAloneId is only allowed for transport managers'
      );
    }
    // Transport managers MUST supply standAloneId (in query) and be validated
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      if (!req.query?.standAloneId)
        return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  getSpotCheckById
);

// Export the router
module.exports = router;
