// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { createSubscriptionTrial } from './subscription-trial.controller';

//Import validation from corresponding module
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-trial
 * @description Create a new subscription-trial
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} controller - ['createSubscriptionTrial']
 */
router.post(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  createSubscriptionTrial
);

// Export the router
module.exports = router;
