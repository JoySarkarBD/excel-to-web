import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { request } from 'express';

/**
 * Planner Validation Schemas and Types
 *
 * This module defines Zod schemas for validating planner related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single planner.
 *
 * → Add all **required** fields here
 */
// base fields for creation
const basePlannerFields = {
  vehicleId: z.string({ message: 'Vehicle ID is required' }).refine(isMongoId, {
    message: 'Vehicle ID must be a valid MongoDB ObjectId',
  }),
  plannerType: z.enum(
    ['INSPECTIONS', 'MOT', 'BRAKE_TEST', 'SERVICE', 'REPAIR', 'TACHO_RECALIBRATION', 'VED'],
    {
      message: 'Planner type must be one of the predefined values',
    }
  ),
  plannerDate: z.string({ message: 'Planner date is required' }).refine(
    (date) => {
      return !isNaN(Date.parse(date));
    },
    { message: 'Planner date must be a valid date string' }
  ),
  requestedDate: z
    .string()
    .refine(
      (date) => {
        return !isNaN(Date.parse(date));
      },
      { message: 'Requested date must be a valid date string' }
    )
    .optional(),
  requestedReason: z
    .string()
    .max(1000, 'Requested reason must be at most 1000 characters')
    .optional(),
  missedReason: z.string().max(1000, 'Missed reason must be at most 1000 characters').optional(),
};

// Transport Manager created: standAloneId is REQUIRED
const zodCreatePlannerAsManagerSchema = z
  .object({
    ...basePlannerFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreatePlannerAsManagerInput = z.infer<typeof zodCreatePlannerAsManagerSchema>;

// Standalone created: no standAloneId
const zodCreatePlannerAsStandAloneSchema = z.object({ ...basePlannerFields }).strict();

export type CreatePlannerAsStandAloneInput = z.infer<typeof zodCreatePlannerAsStandAloneSchema>;

export type CreatePlannerInput = CreatePlannerAsStandAloneInput | CreatePlannerAsManagerInput;

/**
 * Zod schema for validating data when **updating** an existing planner.
 *
 * → All fields should usually be .optional()
 */
const zodUpdatePlannerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdatePlannerInput = z.infer<typeof zodUpdatePlannerSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreatePlannerAsManager = validateBody(zodCreatePlannerAsManagerSchema);
export const validateCreatePlannerAsStandAlone = validateBody(zodCreatePlannerAsStandAloneSchema);
export const validateUpdatePlanner = validateBody(zodUpdatePlannerSchema);

