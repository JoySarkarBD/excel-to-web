import { NextFunction, Request, Response, Router } from 'express';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  createPg9AndPg13PlanAsManager,
  createPg9AndPg13PlanAsStandAlone,
  deletePg9AndPg13PlanAsManager,
  deletePg9AndPg13PlanAsStandAlone,
  getAllPg9AndPg13PlansAsManager,
  getAllPg9AndPg13PlansAsStandAlone,
  getPg9AndPg13PlanByIdAsManager,
  getPg9AndPg13PlanByIdAsStandAlone,
  updatePg9AndPg13PlanAsManager,
  updatePg9AndPg13PlanAsStandAlone,
} from './pg9AndPg13Plan.controller';
import {
  validateCreatePg9AndPg13PlanAsManager,
  validateCreatePg9AndPg13PlanAsStandAlone,
  validatePg9AndPg13PlanAndManagerIdParam,
  validatePg9AndPg13PlanIdParam,
  validateSearchPg9AndPg13PlansQueries,
  validateUpdatePg9AndPg13Plan,
} from './pg9AndPg13Plan.validation';

const router = Router();

// All routes in this router require authentication
router.use(isAuthorized());

/**
 * @route   POST /api/v1/pg9AndPg13Plan/create-pg9-and-pg13-plan
 * @desc    Create a PG9 & PG13 plan (Transport Manager)
 * @access  Private — TRANSPORT_MANAGER
 */
router.post(
  '/create-pg9-and-pg13-plan',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreatePg9AndPg13PlanAsManager,
  validateClientForManagerMiddleware,
  createPg9AndPg13PlanAsManager
);

/**
 * @route   POST /api/v1/pg9AndPg13Plan/create-stand-alone-pg9-and-pg13-plan
 * @desc    Create a PG9 & PG13 plan (Standalone User)
 * @access  Private — STANDALONE_USER
 */
router.post(
  '/create-stand-alone-pg9-and-pg13-plan',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreatePg9AndPg13PlanAsStandAlone,
  createPg9AndPg13PlanAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/pg9AndPg13Plan/get-pg9-and-pg13-plans
 * @desc    Get all PG9 & PG13 plans (TM with standAloneId query, Standalone from token)
 * @access  Private — TRANSPORT_MANAGER | STANDALONE_USER
 */
router.get(
  '/get-pg9-and-pg13-plans',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  validateSearchPg9AndPg13PlansQueries,
  (req: Request, _res: Response, next: NextFunction) => {
    if ((req as any).user?.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, _res, next);
    }
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.role === UserRole.TRANSPORT_MANAGER) {
      return getAllPg9AndPg13PlansAsManager(req, res, next);
    }
    return getAllPg9AndPg13PlansAsStandAlone(req, res, next);
  }
);

/**
 * @route   GET /api/v1/pg9AndPg13Plan/get-pg9-and-pg13-plan/:pg9AndPg13PlanId/:standAloneId
 * @desc    Get a single PG9 & PG13 plan by ID (Transport Manager)
 * @access  Private — TRANSPORT_MANAGER
 */
router.get(
  '/get-pg9-and-pg13-plan/:pg9AndPg13PlanId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validatePg9AndPg13PlanAndManagerIdParam,
  validateClientForManagerMiddleware,
  getPg9AndPg13PlanByIdAsManager
);

/**
 * @route   GET /api/v1/pg9AndPg13Plan/get-pg9-and-pg13-plan/:pg9AndPg13PlanId
 * @desc    Get a single PG9 & PG13 plan by ID (Standalone User)
 * @access  Private — STANDALONE_USER
 */
router.get(
  '/get-pg9-and-pg13-plan/:pg9AndPg13PlanId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validatePg9AndPg13PlanIdParam,
  getPg9AndPg13PlanByIdAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * @route   PATCH /api/v1/pg9AndPg13Plan/update-pg9-and-pg13-plan-by-manager/:pg9AndPg13PlanId/:standAloneId
 * @desc    Update a PG9 & PG13 plan (Transport Manager)
 * @access  Private — TRANSPORT_MANAGER
 */
router.patch(
  '/update-pg9-and-pg13-plan-by-manager/:pg9AndPg13PlanId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validatePg9AndPg13PlanAndManagerIdParam,
  validateUpdatePg9AndPg13Plan,
  validateClientForManagerMiddleware,
  updatePg9AndPg13PlanAsManager
);

/**
 * @route   PATCH /api/v1/pg9AndPg13Plan/update-pg9-and-pg13-plan/:pg9AndPg13PlanId
 * @desc    Update a PG9 & PG13 plan (Standalone User)
 * @access  Private — STANDALONE_USER
 */
router.patch(
  '/update-pg9-and-pg13-plan/:pg9AndPg13PlanId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validatePg9AndPg13PlanIdParam,
  validateUpdatePg9AndPg13Plan,
  updatePg9AndPg13PlanAsStandAlone
);

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * @route   DELETE /api/v1/pg9AndPg13Plan/delete-pg9-and-pg13-plan-by-manager/:pg9AndPg13PlanId/:standAloneId
 * @desc    Delete a PG9 & PG13 plan (Transport Manager)
 * @access  Private — TRANSPORT_MANAGER
 */
router.delete(
  '/delete-pg9-and-pg13-plan-by-manager/:pg9AndPg13PlanId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validatePg9AndPg13PlanAndManagerIdParam,
  validateClientForManagerMiddleware,
  deletePg9AndPg13PlanAsManager
);

/**
 * @route   DELETE /api/v1/pg9AndPg13Plan/delete-pg9-and-pg13-plan/:pg9AndPg13PlanId
 * @desc    Delete a PG9 & PG13 plan (Standalone User)
 * @access  Private — STANDALONE_USER
 */
router.delete(
  '/delete-pg9-and-pg13-plan/:pg9AndPg13PlanId',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validatePg9AndPg13PlanIdParam,
  deletePg9AndPg13PlanAsStandAlone
);

module.exports = router;
