import { NextFunction, Request, Response } from 'express';
import ServerResponse from '../helpers/responses/custom-response';
import { UserRole } from '../models';

// role: 'SUPER_ADMIN' | 'TRANSPORT_MANAGER' | 'STANDALONE_USER' | 'STAFF';

/**
 * Middleware to authorize requests based on user roles.
 *
 * @param roles - An array of roles that are authorized to access the route.
 * @return A middleware function that checks for authorized roles.
 */
const authorizedRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      // Assuming req.user is populated by a previous authentication middleware
      const user = (req as any).user;
      console.log('User role in authorizedRoles middleware ========>', user?.role);
      if (!user || !roles.includes(user.role)) {
        return ServerResponse(
          res,
          false,
          403,
          'Forbidden: You do not have the required permissions'
        );
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      // Handle any unexpected errors
      return ServerResponse(res, false, 403, 'Forbidden');
    }
  };
};

export default authorizedRoles;
