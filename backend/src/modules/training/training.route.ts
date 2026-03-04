import { Router } from 'express';

import {
  createTrainingAsManager,
  createTrainingAsStandAlone,
  deleteTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
} from './training.controller';

import { validateSearchQueries } from '../../handlers/common-zod-validator';
import {
  validateCreateTrainingAsManager,
  validateCreateTrainingAsStandAlone,
  validateSearchTrainingsQueries,
  validateTrainingAndManagerIdParam,
  validateTrainingIdParam,
  validateUpdateTraining,
} from './training.validation';

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
 * @route   POST /api/v1/training/create-training
 * @desc    Create a new training as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-training',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateTrainingAsManager,
  createTrainingAsManager
);

/**
 * @route   POST /api/v1/training/create-stand-alone-training
 * @desc    Create a new training as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-training',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateTrainingAsStandAlone,
  createTrainingAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/training/update-training-by-manager/:trainingId/:standAloneId
 * @desc    Update a training as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-training-by-manager/:trainingId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateTrainingAndManagerIdParam,
  validateUpdateTraining,
  updateTraining
);

/**
 * @route   PATCH /api/v1/training/update-training/:trainingId
 * @desc    Update a training as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateTrainingIdParam,
  validateUpdateTraining,
  updateTraining
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/training/delete-training-by-manager/:trainingId/:standAloneId
 * @desc    Delete a training as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-training-by-manager/:trainingId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateTrainingAndManagerIdParam,
  deleteTraining
);

/**
 * @route   DELETE /api/v1/training/delete-training/:trainingId
 * @desc    Delete a training as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateTrainingIdParam,
  deleteTraining
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/training/get-trainings
 * @desc    Get all trainings (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-trainings',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchTrainingsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllTrainings
);

/**
 * @route   GET /api/v1/training/get-training/:trainingId
 * @desc    Get a single training with all intervalDays
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-training/:trainingId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateTrainingIdParam,
  getTrainingById
);

module.exports = router;
