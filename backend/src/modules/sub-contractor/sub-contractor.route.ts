import { Router } from 'express';

import {
  createSubContractorAsManager,
  createSubContractorAsStandAlone,
  deleteSubContractor,
  getAllSubContractors,
  getSubContractorById,
  updateSubContractor,
} from './sub-contractor.controller';

import { validateSearchQueries } from '../../handlers/common-zod-validator';
import {
  validateCreateSubContractorAsManager,
  validateCreateSubContractorAsStandAlone,
  validateSearchSubContractorsQueries,
  validateSubContractorAndManagerIdParam,
  validateSubContractorIdParam,
  validateUpdateSubContractor,
} from './sub-contractor.validation';

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
 * @route   POST /api/v1/sub-contractor/create-sub-contractor
 * @desc    Create a sub-contractor as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-sub-contractor',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateSubContractorAsManager,
  createSubContractorAsManager
);

/**
 * @route   POST /api/v1/sub-contractor/create-stand-alone-sub-contractor
 * @desc    Create a sub-contractor as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-sub-contractor',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateSubContractorAsStandAlone,
  createSubContractorAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/sub-contractor/update-sub-contractor-by-manager/:subContractorId/:standAloneId
 * @desc    Update a sub-contractor as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-sub-contractor-by-manager/:subContractorId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSubContractorAndManagerIdParam,
  validateUpdateSubContractor,
  updateSubContractor
);

/**
 * @route   PATCH /api/v1/sub-contractor/update-sub-contractor/:subContractorId
 * @desc    Update a sub-contractor as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-sub-contractor/:subContractorId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateSubContractorIdParam,
  validateUpdateSubContractor,
  updateSubContractor
);

// ═══════════════════════════════════════════════════════════════
// DELETE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/sub-contractor/delete-sub-contractor-by-manager/:subContractorId/:standAloneId
 * @desc    Delete a sub-contractor as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-sub-contractor-by-manager/:subContractorId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateSubContractorAndManagerIdParam,
  deleteSubContractor
);

/**
 * @route   DELETE /api/v1/sub-contractor/delete-sub-contractor/:subContractorId
 * @desc    Delete a sub-contractor as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-sub-contractor/:subContractorId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateSubContractorIdParam,
  deleteSubContractor
);

// ═══════════════════════════════════════════════════════════════
// GET ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/sub-contractor/get-sub-contractors
 * @desc    Get all sub-contractors (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-sub-contractors',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchSubContractorsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllSubContractors
);

/**
 * @route   GET /api/v1/sub-contractor/get-sub-contractor/:subContractorId
 * @desc    Get a single sub-contractor by ID
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-sub-contractor/:subContractorId',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateSubContractorIdParam,
  getSubContractorById
);

module.exports = router;
