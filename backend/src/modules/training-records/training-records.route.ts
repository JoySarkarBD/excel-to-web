import { Router } from 'express';

import { getTrainingRecords, updateRecordStatus } from './training-records.controller';

import {
  validateRecordAndManagerIdParam,
  validateRecordIdParam,
  validateSearchRecordsQueries,
  validateSearchRecordsStandaloneQueries,
  validateUpdateRecordStatus,
} from './training-records.validation';

import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

const router = Router();
router.use(isAuthorized());

// ═══════════════════════════════════════════════════════════════
// UPDATE — Status of individual register entry
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/training-records/update-record-status-by-manager/:registerId/:standAloneId
 * @desc    Update the status of a training register entry as a Transport Manager
 * @access  Transport Manager
 */
router.patch(
  '/update-record-status-by-manager/:registerId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateRecordAndManagerIdParam,
  validateUpdateRecordStatus,
  updateRecordStatus
);

/**
 * @route   PATCH /api/v1/training-records/update-record-status/:registerId
 * @desc    Update the status of a training register entry as a Standalone User
 * @access  Standalone User
 */
router.patch(
  '/update-record-status/:registerId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRecordIdParam,
  validateUpdateRecordStatus,
  updateRecordStatus
);

// ═══════════════════════════════════════════════════════════════
// GET — Grouped Training Records Report
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/training-records/get-training-records
 * @desc    Get grouped training records report (paginated + searchable + status filter)
 * @access  Transport Manager & Standalone User
 */
router.get(
  '/get-training-records',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchRecordsQueries(req, res, next);
    }
    return validateSearchRecordsStandaloneQueries(req, res, next);
  },
  getTrainingRecords
);

module.exports = router;
