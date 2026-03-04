// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createSelfServiceAsManager,
  createSelfServiceAsStandAlone,
  deleteSelfService,
  getManySelfService,
  getSelfServiceById,
  updateSelfService,
} from './self-service.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateSelfServiceAsManager,
  validateCreateSelfServiceAsStandAlone,
  validateSearchSelfServiceQueries,
  validateSelfServiceAndManagerIdParam,
  validateSelfServiceIdParam,
  validateUpdateSelfService,
} from './self-service.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * Create self service as manager
 *
 * @route POST /api/v1/self-service/create-self-service
 * @description Create a new self-service as Transport Manager
 * @access Public
 * @param {function} validation - ['validateCreateSelfService']
 * @param {function} controller - ['createSelfService']
 */
router.post(
  '/create-self-service',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateSelfServiceAsManager,
  validateClientForManagerMiddleware,
  createSelfServiceAsManager
);

/**
 * Create self service as stand alone user
 *
 * @route POST /api/v1/self-service/create-stand-alone-self-service
 * @description Create a new self-service as Standalone User
 * @access Public
 * @param {function} validation - ['validateCreateSelfServiceAsStandAlone']
 * @param {function} controller - ['createSelfService']
 */
router.post(
  '/create-stand-alone-self-service',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateSelfServiceAsStandAlone,
  createSelfServiceAsStandAlone
);

/**
 * @route PATCH /api/v1/self-service/update-self-service/:id/:standAloneId
 * @description Update self-service information as Transport Manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to update
 * @param {function} validation - ['validateId', 'validateUpdateSelfService']
 * @param {function} controller - ['updateSelfService']
 */
router.patch(
  '/update-self-service/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSelfServiceAndManagerIdParam,
  validateUpdateSelfService,
  updateSelfService
);

/**
 * @route PATCH /api/v1/self-service/update-self-service/:id
 * @description Update self-service information as Standalone User
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to update
 * @param {function} validation - ['validateId', 'validateUpdateSelfService']
 * @param {function} controller - ['updateSelfService']
 */
router.patch(
  '/update-self-service/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateUpdateSelfService,
  updateSelfService
);

/**
 * @route DELETE /api/v1/self-service/delete-self-service/:id/:standAloneId
 * @description Delete a self-service as Transport Manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSelfService']
 */
router.delete(
  '/delete-self-service/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSelfServiceAndManagerIdParam,
  deleteSelfService
);

/**
 * @route DELETE /api/v1/self-service/delete-self-service/:id
 * @description Delete a self-service as Standalone User
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSelfService']
 */
router.delete(
  '/delete-self-service/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateSelfServiceIdParam,
  deleteSelfService
);

/**
 * @route GET /api/v1/self-service/get-self-service/many
 * @description Get multiple self-services
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySelfService']
 */
router.get(
  '/get-self-service/many',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchSelfServiceQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManySelfService
);

/**
 * @route GET /api/v1/self-service/get-self-service/:id/:standAloneId
 * @description Get a self-service by ID as Transport Manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSelfServiceById']
 */
router.get(
  '/get-self-service/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateSelfServiceAndManagerIdParam,
  getSelfServiceById
);

/**
 * @route GET /api/v1/self-service/get-self-service/:id
 * @description Get a self-service by ID as Standalone User
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSelfServiceById']
 */
router.get(
  '/get-self-service/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateSelfServiceIdParam,
  getSelfServiceById
);

// Export the router
module.exports = router;
