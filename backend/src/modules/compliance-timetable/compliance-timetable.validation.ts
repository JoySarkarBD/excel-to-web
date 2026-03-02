import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { ComplianceStatus } from '../../models/compliance-enforcement-dvsa/complianceTimeTable.schema';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Driver Validation Schemas and Types
 *
 * This module defines Zod schemas for validating driver related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Base Zod schema for common compliance-timetable fields
 */
const baseComplianceTimetableFields = {
  task: z
    .string({ message: 'Task must be a string' })
    .min(1, 'Task must be at least 1 character')
    .max(150, 'Task must not exceed 150 characters'),
  responsibleParty: z
    .string({ message: 'Responsible party must be a string' })
    .min(1, 'Responsible party is required')
    .max(150, 'Responsible party must not exceed 150 characters'),
  dueDate: z.coerce.date({ message: 'Due date must be a valid date string' }).optional(),
  status: z.enum(Object.values(ComplianceStatus) as [string, ...string[]]).optional(),
};

/**
 * Zod schema for creating a compliance-timetable as a Transport Manager
 * → standAloneId is REQUIRED (must be one of the manager's approved clients)
 */
const zodCreateComplianceTimetableAsTransportManagerSchema = z
  .object({
    ...baseComplianceTimetableFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateComplianceTimetableAsTransportManagerInput = z.infer<
  typeof zodCreateComplianceTimetableAsTransportManagerSchema
>;

/**
 * Zod schema for creating a driver as a Stand-Alone user
 * → standAloneId is optional (stand-alone users employ their own drivers)
 */
const zodCreateComplianceTimetableAsStandAloneSchema = z
  .object({
    ...baseComplianceTimetableFields,
  })
  .strict();

export type CreateComplianceTimetableAsStandAloneInput = z.infer<
  typeof zodCreateComplianceTimetableAsStandAloneSchema
>;

// Legacy type for backward compatibility
export type CreateComplianceTimetableInput =
  | CreateComplianceTimetableAsTransportManagerInput
  | CreateComplianceTimetableAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing compliance-timetable.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateComplianceTimetableSchema = z
  .object({
    task: baseComplianceTimetableFields.task.optional(),
    responsibleParty: baseComplianceTimetableFields.responsibleParty.optional(),
    dueDate: baseComplianceTimetableFields.dueDate.optional(),
    status: baseComplianceTimetableFields.status.optional(),
  })
  .strict();

export type UpdateComplianceTimetableInput = z.infer<typeof zodUpdateComplianceTimetableSchema>;

/**
 * Zod schema for validating search query parameters when retrieving multiple compliance-timetables.
 * This can be extended with compliance-timetable-specific search parameters as needed.
 */

const zodSearchComplianceTimetableSchema = zodSearchQuerySchema.extend({
  // You can add compliance-timetable-specific search query parameters here if needed
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type SearchComplianceTimetableQueryInput = z.infer<typeof zodSearchComplianceTimetableSchema>;

/**
 * Zod schema for validating the deletion of a compliance-timetable, ensuring the provided IDs are valid MongoDB ObjectIds.
 */
const zodComplianceTimetableAndManagerIdSchema = z.object({
  id: z.string().refine(isMongoId, {
    message: 'Please provide a valid MongoDB ObjectId for compliance timetable ID',
  }),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type ComplianceTimetableAndManagerIdInput = z.infer<
  typeof zodComplianceTimetableAndManagerIdSchema
>;

/**
 * Zod schema for validating the deletion of a compliance-timetable, ensuring the provided IDs are valid MongoDB ObjectIds.
 */

const zodDeleteComplianceTimetableSchema = zodComplianceTimetableAndManagerIdSchema.strict();

export type DeleteComplianceTimetableInput = z.infer<typeof zodDeleteComplianceTimetableSchema>;

const zodUpdateComplianceTimetableIdSchema = zodComplianceTimetableAndManagerIdSchema.strict();

export type UpdateComplianceTimetableInputWithIds = z.infer<
  typeof zodUpdateComplianceTimetableIdSchema
>;

/** Standalone user: single registerId param */
const zodComplianceTimetableIdParamSchema = z
  .object({
    id: z
      .string({ message: 'Compliance timetable id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type ComplianceTimetableIdParamInput = z.infer<typeof zodComplianceTimetableIdParamSchema>;

const zodGetComplianceTimetableByIdParamsSchema = z
  .object({
    id: z.string({ message: 'Id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for compliance timetable ID',
    }),
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
      .optional(),
  })
  .strict();

export type GetComplianceTimetableByIdParamsInput = z.infer<
  typeof zodGetComplianceTimetableByIdParamsSchema
>;

/**
 * Named validators — use these directly in your Express routes
 */
// export const validateCreateVehicleAsTransportManager = validateBody(zodCreateVehicleAsTransportManagerSchema);
export const validateCreateComplianceTimetableAsTransportManager = validateBody(zodCreateComplianceTimetableAsTransportManagerSchema);
export const validateCreateComplianceTimetableAsStandAlone = validateBody(zodCreateComplianceTimetableAsStandAloneSchema);
export const validateDeleteComplianceTimetableIds = validateParams(zodDeleteComplianceTimetableSchema);
export const validateUpdateComplianceTimetable = validateBody(zodUpdateComplianceTimetableSchema);
export const validateUpdateComplianceTimetableIds = validateParams(zodUpdateComplianceTimetableIdSchema);
export const validateSearchComplianceTimetableQueries = validateQuery(zodSearchComplianceTimetableSchema);
export const validateGetComplianceTimetableByIdParams = validateParams(zodGetComplianceTimetableByIdParamsSchema);
export const validateComplianceTimetableIdParam = validateParams(zodComplianceTimetableIdParamSchema);

