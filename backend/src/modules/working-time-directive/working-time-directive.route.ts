import { Router } from 'express';

import {
  createWorkingTimeDirectiveAsManager,
  createWorkingTimeDirectiveAsStandAlone,
  deleteWorkingTimeDirective,
  getAllWorkingTimeDirectives,
  getDriversWithVehicles,
  getWorkingTimeDirectiveById,
  updateWorkingTimeDirective,
} from './working-time-directive.controller';

import { validateSearchQueries } from '../../handlers/common-zod-validator';
import {
  validateCreateWorkingTimeDirectiveAsManager,
  validateCreateWorkingTimeDirectiveAsStandAlone,
  validateSearchWorkingTimeDirectivesQueries,
  validateUpdateWorkingTimeDirective,
  validateWorkingTimeDirectiveAndManagerIdParam,
  validateWorkingTimeDirectiveIdParam,
} from './working-time-directive.validation';

import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

const router = Router();
router.use(isAuthorized());

// ═══════════════════════════════════════════════════════════════
// CREATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/working-time-directive/create-working-time-directive
 * @desc    Create a working time directive as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-working-time-directive',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateWorkingTimeDirectiveAsManager,
  createWorkingTimeDirectiveAsManager
);

/**
 * @route   POST /api/v1/working-time-directive/create-stand-alone-working-time-directive
 * @desc    Create a working time directive as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-working-time-directive',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateWorkingTimeDirectiveAsStandAlone,
  createWorkingTimeDirectiveAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/working-time-directive/update-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId
 * @desc    Update a working time directive as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateWorkingTimeDirectiveAndManagerIdParam,
  validateUpdateWorkingTimeDirective,
  updateWorkingTimeDirective
);

/**
 * @route   PATCH /api/v1/working-time-directive/update-working-time-directive/:workingTimeDirectiveId
 * @desc    Update a working time directive as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-working-time-directive/:workingTimeDirectiveId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateWorkingTimeDirectiveIdParam,
  validateUpdateWorkingTimeDirective,
  updateWorkingTimeDirective
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/working-time-directive/delete-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId
 * @desc    Delete a working time directive as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateWorkingTimeDirectiveAndManagerIdParam,
  deleteWorkingTimeDirective
);

/**
 * @route   DELETE /api/v1/working-time-directive/delete-working-time-directive/:workingTimeDirectiveId
 * @desc    Delete a working time directive as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-working-time-directive/:workingTimeDirectiveId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateWorkingTimeDirectiveIdParam,
  deleteWorkingTimeDirective
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/working-time-directive/get-working-time-directives
 * @desc    Get all working time directives (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-working-time-directives',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchWorkingTimeDirectivesQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllWorkingTimeDirectives
);

/**
 * @route   GET /api/v1/working-time-directive/get-working-time-directive/:workingTimeDirectiveId
 * @desc    Get a single working time directive by ID
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-working-time-directive/:workingTimeDirectiveId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateWorkingTimeDirectiveIdParam,
  getWorkingTimeDirectiveById
);

/**
 * @route   GET /api/v1/working-time-directive/get-drivers-with-vehicles
 * @desc    Get all drivers belonging to the standalone user, each with their assigned vehicles
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-drivers-with-vehicles',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  getDriversWithVehicles
);

module.exports = router;
