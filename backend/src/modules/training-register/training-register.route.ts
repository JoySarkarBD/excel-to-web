import { Router } from 'express';

import {
  createRegisterAsManager,
  createRegisterAsStandAlone,
  deleteRegister,
  getAllRegisters,
  getRegisterById,
  updateRegister,
} from './training-register.controller';

import { validateSearchQueries } from '../../handlers/common-zod-validator';
import {
  validateCreateRegisterAsManager,
  validateCreateRegisterAsStandAlone,
  validateRegisterAndManagerIdParam,
  validateRegisterIdParam,
  validateSearchRegistersQueries,
  validateUpdateRegister,
} from './training-register.validation';

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
 * @route   POST /api/v1/training-register/create-register
 * @desc    Create a training register entry as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-register',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateRegisterAsManager,
  createRegisterAsManager
);

/**
 * @route   POST /api/v1/training-register/create-stand-alone-register
 * @desc    Create a training register entry as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-register',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateRegisterAsStandAlone,
  createRegisterAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/training-register/update-register-by-manager/:registerId/:standAloneId
 * @desc    Update a training register entry as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-register-by-manager/:registerId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRegisterAndManagerIdParam,
  validateUpdateRegister,
  updateRegister
);

/**
 * @route   PATCH /api/v1/training-register/update-register/:registerId
 * @desc    Update a training register entry as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-register/:registerId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRegisterIdParam,
  validateUpdateRegister,
  updateRegister
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/training-register/delete-register-by-manager/:registerId/:standAloneId
 * @desc    Delete a training register entry as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-register-by-manager/:registerId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRegisterAndManagerIdParam,
  deleteRegister
);

/**
 * @route   DELETE /api/v1/training-register/delete-register/:registerId
 * @desc    Delete a training register entry as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-register/:registerId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRegisterIdParam,
  deleteRegister
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/training-register/get-registers
 * @desc    Get all training register entries (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-registers',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchRegistersQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllRegisters
);

/**
 * @route   GET /api/v1/training-register/get-register/:registerId
 * @desc    Get a single training register entry by ID
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-register/:registerId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateRegisterIdParam,
  getRegisterById
);

module.exports = router;
