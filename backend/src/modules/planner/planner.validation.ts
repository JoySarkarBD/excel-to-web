import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

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

// for validating search query parameters when retrieving multiple planners
const zodSearchPlannerSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' })
    .optional(),
});

export type SearchPlannerQueryInput = z.infer<typeof zodSearchPlannerSchema>;

// for validating the :id param in routes like GET /planner/:id, PUT /planner/:id, DELETE /planner/:id
const zodPlannerIdParamSchema = z
  .object({
    id: z.string({ message: 'Planner id is required' }).refine(isMongoId, {
      message: 'Planner id must be a valid MongoDB ObjectId',
    }),
  })
  .strict();

export type PlannerIdParamInput = z.infer<typeof zodPlannerIdParamSchema>;

// for validating the :id and :standAloneId params in routes like GET /planner/:id/:standAloneId, PUT /planner/:id/:standAloneId, DELETE /planner/:id/:standAloneId
const zodPlannerAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'Planner id is required' }).refine(isMongoId, {
      message: 'Planner id must be a valid MongoDB ObjectId',
    }),
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type PlannerAndManagerIdParamInput = z.infer<typeof zodPlannerAndManagerIdParamSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreatePlannerAsManager = validateBody(zodCreatePlannerAsManagerSchema);
export const validateCreatePlannerAsStandAlone = validateBody(zodCreatePlannerAsStandAloneSchema);
export const validateUpdatePlanner = validateBody(zodUpdatePlannerSchema);
export const validateSearchPlannerQueries = validateQuery(zodSearchPlannerSchema);
export const validateIdParam = validateParams(zodPlannerIdParamSchema);
export const validateIdAndManagerParam = validateParams(zodPlannerAndManagerIdParamSchema);

