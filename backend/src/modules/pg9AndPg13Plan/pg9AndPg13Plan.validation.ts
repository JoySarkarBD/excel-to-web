import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * PG9 & PG13 Plan Validation Schemas
 *
 * Supports both Transport Manager and Standalone User roles.
 * Fields: vehicleId, issueType (PG9 | DV79D), defectDescription,
 *         clearanceStatus, tcContactMade, maintenanceProvider,
 *         meetingDate, notes, followUp
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single pg9AndPg13PlanId param */
const zodPg9AndPg13PlanIdParamSchema = z
  .object({
    pg9AndPg13PlanId: z
      .string({ message: 'PG9 & PG13 plan id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type Pg9AndPg13PlanIdParamInput = z.infer<typeof zodPg9AndPg13PlanIdParamSchema>;

/** TM: pg9AndPg13PlanId + standAloneId params */
const zodPg9AndPg13PlanAndManagerIdParamSchema = z
  .object({
    pg9AndPg13PlanId: z
      .string({ message: 'PG9 & PG13 plan id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for pg9AndPg13PlanId' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type Pg9AndPg13PlanAndManagerIdParamInput = z.infer<typeof zodPg9AndPg13PlanAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base PG9 & PG13 plan fields (shared between TM and standalone create) */
const basePg9AndPg13PlanFields = {
  vehicleId: z
    .string({ message: 'Vehicle id is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  issueType: z.enum(['PG9', 'DV79D'], { message: 'Issue type must be either PG9 or DV79D' }),
  defectDescription: z
    .string({ message: 'Defect description must be a string' })
    .max(2000, 'Defect description must not exceed 2000 characters')
    .optional(),
  clearanceStatus: z
    .string({ message: 'Clearance status must be a string' })
    .max(200, 'Clearance status must not exceed 200 characters')
    .optional(),
  tcContactMade: z
    .boolean({ message: 'TC contact made must be a boolean' })
    .optional(),
  maintenanceProvider: z
    .string({ message: 'Maintenance provider must be a string' })
    .max(300, 'Maintenance provider must not exceed 300 characters')
    .optional(),
  meetingDate: z
    .string({ message: 'Meeting date must be a string' })
    .datetime({ message: 'Meeting date must be a valid ISO date string' })
    .optional(),
  notes: z
    .string({ message: 'Notes must be a string' })
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  followUp: z
    .boolean({ message: 'Follow up must be a boolean' })
    .optional(),
};

/** TM create: standAloneId is REQUIRED */
const zodCreatePg9AndPg13PlanAsManagerSchema = z
  .object({
    ...basePg9AndPg13PlanFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreatePg9AndPg13PlanAsManagerInput = z.infer<typeof zodCreatePg9AndPg13PlanAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreatePg9AndPg13PlanAsStandAloneSchema = z
  .object({
    ...basePg9AndPg13PlanFields,
  })
  .strict();

export type CreatePg9AndPg13PlanAsStandAloneInput = z.infer<typeof zodCreatePg9AndPg13PlanAsStandAloneSchema>;

// Legacy union type
export type CreatePg9AndPg13PlanInput = CreatePg9AndPg13PlanAsManagerInput | CreatePg9AndPg13PlanAsStandAloneInput;

/** Update PG9 & PG13 plan (shared for both roles) — all fields optional, at least 1 required */
const zodUpdatePg9AndPg13PlanSchema = z
  .object({
    vehicleId: z
      .string({ message: 'Vehicle id must be a string' })
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    issueType: z
      .enum(['PG9', 'DV79D'], { message: 'Issue type must be either PG9 or DV79D' })
      .optional(),
    defectDescription: z
      .string({ message: 'Defect description must be a string' })
      .max(2000, 'Defect description must not exceed 2000 characters')
      .optional(),
    clearanceStatus: z
      .string({ message: 'Clearance status must be a string' })
      .max(200, 'Clearance status must not exceed 200 characters')
      .optional(),
    tcContactMade: z
      .boolean({ message: 'TC contact made must be a boolean' })
      .optional(),
    maintenanceProvider: z
      .string({ message: 'Maintenance provider must be a string' })
      .max(300, 'Maintenance provider must not exceed 300 characters')
      .optional(),
    meetingDate: z
      .string({ message: 'Meeting date must be a string' })
      .datetime({ message: 'Meeting date must be a valid ISO date string' })
      .optional(),
    notes: z
      .string({ message: 'Notes must be a string' })
      .max(2000, 'Notes must not exceed 2000 characters')
      .optional(),
    followUp: z
      .boolean({ message: 'Follow up must be a boolean' })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdatePg9AndPg13PlanInput = z.infer<typeof zodUpdatePg9AndPg13PlanSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchPg9AndPg13PlansSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchPg9AndPg13PlansQueryInput = z.infer<typeof zodSearchPg9AndPg13PlansSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validatePg9AndPg13PlanIdParam = validateParams(zodPg9AndPg13PlanIdParamSchema);
export const validatePg9AndPg13PlanAndManagerIdParam = validateParams(zodPg9AndPg13PlanAndManagerIdParamSchema);

// Body validators
export const validateCreatePg9AndPg13PlanAsManager = validateBody(zodCreatePg9AndPg13PlanAsManagerSchema);
export const validateCreatePg9AndPg13PlanAsStandAlone = validateBody(zodCreatePg9AndPg13PlanAsStandAloneSchema);
export const validateUpdatePg9AndPg13Plan = validateBody(zodUpdatePg9AndPg13PlanSchema);

// Search query validators
export const validateSearchPg9AndPg13PlansQueries = validateQuery(zodSearchPg9AndPg13PlansSchema);