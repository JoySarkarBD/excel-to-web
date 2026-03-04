import { Router } from 'express';

import {
  createParticipantAsManager,
  createParticipantAsStandAlone,
  createRoleAsManager,
  createRoleAsStandAlone,
  deleteParticipant,
  deleteRole,
  getAllParticipants,
  getAllRoles,
  getParticipantById,
  updateParticipant,
  updateRole,
} from './participants.controller';

import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import {
  validateCreateParticipantAsManager,
  validateCreateParticipantAsStandAlone,
  validateCreateRoleAsManager,
  validateCreateRoleAsStandAlone,
  validateParticipantAndManagerIdParam,
  validateRoleAndManagerIdParam,
  validateSearchParticipantsQueries,
  validateUpdateParticipant,
  validateUpdateRole,
} from './participants.validation';

import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

const router = Router();
router.use(isAuthorized());

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT ROLE ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/participants/create-role
 * @desc    Create a new participant role as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-role',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateRoleAsManager,
  createRoleAsManager
);

/**
 * @route   POST /api/v1/participants/create-stand-alone-role
 * @desc    Create a new participant role as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-role',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateRoleAsStandAlone,
  createRoleAsStandAlone
);

/**
 * @route   PATCH /api/v1/participants/update-role-by-manager/:roleId/:standAloneId
 * @desc    Update a participant role as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-role-by-manager/:roleId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRoleAndManagerIdParam,
  validateUpdateRole,
  updateRole
);

/**
 * @route   PATCH /api/v1/participants/update-role/:id
 * @desc    Update a participant role as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-role/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateRole,
  updateRole
);

/**
 * @route   DELETE /api/v1/participants/delete-role-by-manager/:roleId/:standAloneId
 * @desc    Delete a participant role as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-role-by-manager/:roleId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRoleAndManagerIdParam,
  deleteRole
);

/**
 * @route   DELETE /api/v1/participants/delete-role/:id
 * @desc    Delete a participant role as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-role/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteRole
);

/**
 * @route   GET /api/v1/participants/get-roles
 * @desc    Get all participant roles (paginated)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-roles',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchParticipantsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllRoles
);

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/participants/create-participant
 * @desc    Create a new participant as a Transport Manager
 * @access  Transport Manager
 */
router.post(
  '/create-participant',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateParticipantAsManager,
  createParticipantAsManager
);

/**
 * @route   POST /api/v1/participants/create-stand-alone-participant
 * @desc    Create a new participant as a Standalone User
 * @access  Standalone User
 */
router.post(
  '/create-stand-alone-participant',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateParticipantAsStandAlone,
  createParticipantAsStandAlone
);

/**
 * @route   PATCH /api/v1/participants/update-participant-by-manager/:participantId/:standAloneId
 * @desc    Update a participant as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-participant-by-manager/:participantId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateParticipantAndManagerIdParam,
  validateUpdateParticipant,
  updateParticipant
);

/**
 * @route   PATCH /api/v1/participants/update-participant/:id
 * @desc    Update a participant as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-participant/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateParticipant,
  updateParticipant
);

/**
 * @route   DELETE /api/v1/participants/delete-participant-by-manager/:participantId/:standAloneId
 * @desc    Delete a participant as a Transport Manager
 * @access  Transport Manager
 */
router.delete(
  '/delete-participant-by-manager/:participantId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateParticipantAndManagerIdParam,
  deleteParticipant
);

/**
 * @route   DELETE /api/v1/participants/delete-participant/:id
 * @desc    Delete a participant as a Standalone User
 * @access  Standalone User
 */
router.delete(
  '/delete-participant/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteParticipant
);

/**
 * @route   GET /api/v1/participants/get-participants
 * @desc    Get all participants (paginated + searchable)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-participants',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchParticipantsQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllParticipants
);

/**
 * @route   GET /api/v1/participants/get-participant/:id
 * @desc    Get a single participant by ID
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-participant/:id',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  validateId,
  getParticipantById
);

module.exports = router;
