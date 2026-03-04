// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createTrainingToolboxAsManager,
  createTrainingToolboxAsStandAlone,
  deleteTrainingToolbox,
  getManyTrainingToolbox,
  getTrainingToolboxById,
  updateTrainingToolbox,
} from './training-toolbox.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateTrainingToolboxAsManager,
  validateCreateTrainingToolboxAsStandAlone,
  validateSearchTrainingToolboxQueries,
  validateTrainingToolboxAndManagerIdParam,
  validateTrainingToolboxIdParam,
  validateUpdateTrainingToolbox,
} from './training-toolbox.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/training-toolbox/create-training-toolbox
 * @description Create a new training-toolbox as transport manager
 * @access Public
 * @param {function} validation - ['validateCreateTrainingToolbox']
 * @param {function} controller - ['createTrainingToolbox']
 */
router.post(
  '/create-training-toolbox',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateTrainingToolboxAsManager,
  validateClientForManagerMiddleware,
  createTrainingToolboxAsManager
);

/**
 * @route POST /api/v1/training-toolbox/create-stand-alone-training-toolbox
 * @description Create a new training-toolbox as stand-alone user
 * @access Public
 * @param {function} validation - ['validateCreateTrainingToolboxAsStandAlone']
 * @param {function} controller - ['createTrainingToolboxAsStandAlone']
 */
router.post(
  '/create-stand-alone-training-toolbox',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateTrainingToolboxAsStandAlone,
  createTrainingToolboxAsStandAlone
);

/**
 * @route PATCH /api/v1/training-toolbox/update-training-toolbox/:id/:standAloneId
 * @description Update training-toolbox information as transport manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to update
 * @param {function} validation - ['validateId', 'validateUpdateTrainingToolbox']
 * @param {function} controller - ['updateTrainingToolbox']
 */
router.patch(
  '/update-training-toolbox/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateTrainingToolboxAndManagerIdParam,
  validateUpdateTrainingToolbox,
  updateTrainingToolbox
);

/**
 * @route PATCH /api/v1/training-toolbox/update-training-toolbox/:id
 * @description Update training-toolbox information as stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to update
 * @param {function} validation - ['validateId', 'validateUpdateTrainingToolbox']
 * @param {function} controller - ['updateTrainingToolbox']
 */
router.patch(
  '/update-training-toolbox/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateTrainingToolboxIdParam,
  validateUpdateTrainingToolbox,
  updateTrainingToolbox
);

/**
 * @route DELETE /api/v1/training-toolbox/delete-training-toolbox/:id/:standAloneId
 * @description Delete a training-toolbox as transport manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTrainingToolbox']
 */
router.delete(
  '/delete-training-toolbox/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateTrainingToolboxAndManagerIdParam,
  deleteTrainingToolbox
);

/**
 * @route DELETE /api/v1/training-toolbox/delete-training-toolbox/:id
 * @description Delete a training-toolbox as stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTrainingToolbox']
 */
router.delete(
  '/delete-training-toolbox/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateTrainingToolboxIdParam,
  deleteTrainingToolbox
);

/**
 * @route GET /api/v1/training-toolbox/get-training-toolbox/many
 * @description Get multiple training-toolboxes
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTrainingToolbox']
 */
router.get(
  '/get-training-toolbox/many',
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
      return validateSearchTrainingToolboxQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyTrainingToolbox
);

/**
 * @route GET /api/v1/training-toolbox/get-training-toolbox/:id/:standAloneId
 * @description Get a training-toolbox by ID as transport manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTrainingToolboxById']
 */
router.get(
  '/get-training-toolbox/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrainingToolboxAndManagerIdParam,
  getTrainingToolboxById
);

/**
 * @route GET /api/v1/training-toolbox/get-training-toolbox/:id
 * @description Get a training-toolbox by ID as stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTrainingToolboxById']
 */
router.get(
  '/get-training-toolbox/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrainingToolboxIdParam,
  getTrainingToolboxById
);

// Export the router
module.exports = router;
