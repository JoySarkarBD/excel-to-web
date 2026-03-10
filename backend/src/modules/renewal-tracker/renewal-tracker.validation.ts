import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { RenewalTrackerStatus } from '../../models/compliance-enforcement-dvsa/renewalTracker.schema';

const optionalDateInput = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

/**
 * Renewal-tracker Validation Schemas and Types
 *
 * This module defines Zod schemas for validating renewal-tracker related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single renewal-tracker.
 *
 * → Add all **required** fields here
 */
const baseRenewalTrackerFields = {
  type: z.string({ message: 'type is required' }).min(1).max(120).trim(),
  item: z.string({ message: 'item is required' }).min(1).max(200).trim(),
  description: z.string().trim().optional(),
  refOrPolicyNo: z
    .string()
    .refine(isMongoId, { message: 'refOrPolicyNo must be a valid MongoDB ObjectId' })
    .optional(),
  responsiblePerson: z
    .string()
    .refine(isMongoId, { message: 'responsiblePerson must be a valid MongoDB ObjectId' })
    .optional(),
  providerOrIssuer: z.string().trim().optional(),
  startDate: optionalDateInput,
  expiryOrDueDate: optionalDateInput,
  reminderSet: z.boolean().optional(),
  reminderDate: optionalDateInput,
  status: z
    .enum(Object.values(RenewalTrackerStatus), {
      message: 'status must be one of the valid renewal tracker status values',
    })
    .optional(),
  notes: z.string().trim().optional(),
  createdBy: z
    .string()
    .refine(isMongoId, { message: 'createdBy must be a valid MongoDB ObjectId' })
    .optional(),
};

// Create renewal-tracker as transport manager
const zodCreateRenewalTrackerAsManagerSchema = z
  .object({
    ...baseRenewalTrackerFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

// Create renewal-tracker as stand-alone user
const zodCreateRenewalTrackerAsStandAloneSchema = z
  .object({
    ...baseRenewalTrackerFields,
  })
  .strict();

const zodCreateRenewalTrackerSchema = zodCreateRenewalTrackerAsStandAloneSchema;

export type CreateRenewalTrackerAsManagerInput = z.infer<
  typeof zodCreateRenewalTrackerAsManagerSchema
>;
export type CreateRenewalTrackerAsStandAloneInput = z.infer<
  typeof zodCreateRenewalTrackerAsStandAloneSchema
>;
export type CreateRenewalTrackerInput =
  | CreateRenewalTrackerAsManagerInput
  | CreateRenewalTrackerAsStandAloneInput;

/**
 * Zod schema for validating **bulk creation** (array of renewal-tracker objects).
 */
const zodCreateManyRenewalTrackerSchema = z
  .array(zodCreateRenewalTrackerSchema)
  .min(1, { message: 'At least one renewal-tracker must be provided for bulk creation' });

export type CreateManyRenewalTrackerInput = z.infer<typeof zodCreateManyRenewalTrackerSchema>;

/**
 * Zod schema for validating data when **updating** an existing renewal-tracker.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateRenewalTrackerSchema = z
  .object({
    type: z.string().min(1).max(120).trim().optional(),
    item: z.string().min(1).max(200).trim().optional(),
    description: z.string().trim().optional(),
    refOrPolicyNo: z
      .string()
      .refine(isMongoId, { message: 'refOrPolicyNo must be a valid MongoDB ObjectId' })
      .optional(),
    responsiblePerson: z
      .string()
      .refine(isMongoId, { message: 'responsiblePerson must be a valid MongoDB ObjectId' })
      .optional(),
    providerOrIssuer: z.string().trim().optional(),
    startDate: optionalDateInput,
    expiryOrDueDate: optionalDateInput,
    reminderSet: z.boolean().optional(),
    reminderDate: optionalDateInput,
    status: z
      .enum(Object.values(RenewalTrackerStatus), {
        message: 'status must be one of the valid renewal tracker status values',
      })
      .optional(),
    notes: z.string().trim().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateRenewalTrackerInput = z.infer<typeof zodUpdateRenewalTrackerSchema>;

/**
 * Zod schema for validating bulk updates (array of partial renewal-tracker objects).
 */
const zodUpdateManyRenewalTrackerForBulkSchema = zodUpdateRenewalTrackerSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple renewal-tracker updates.
 */
const zodUpdateManyRenewalTrackerSchema = z
  .array(zodUpdateManyRenewalTrackerForBulkSchema)
  .min(1, { message: 'At least one renewal-tracker update object must be provided' });

export type UpdateManyRenewalTrackerInput = z.infer<typeof zodUpdateManyRenewalTrackerSchema>;

const zodSearchRenewalTrackerSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

const zodRenewalTrackerIdParamSchema = z
  .object({
    id: z.string({ message: 'renewal-tracker id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();

const zodRenewalTrackerAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'renewal-tracker id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for renewal-tracker id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateRenewalTracker = validateBody(zodCreateRenewalTrackerSchema);
export const validateCreateManyRenewalTracker = validateBody(zodCreateManyRenewalTrackerSchema);
export const validateUpdateRenewalTracker = validateBody(zodUpdateRenewalTrackerSchema);
export const validateUpdateManyRenewalTracker = validateBody(zodUpdateManyRenewalTrackerSchema);
export const validateCreateRenewalTrackerAsManager = validateBody(
  zodCreateRenewalTrackerAsManagerSchema
);
export const validateCreateRenewalTrackerAsStandAlone = validateBody(
  zodCreateRenewalTrackerAsStandAloneSchema
);
export const validateSearchRenewalTrackerQueries = validateQuery(zodSearchRenewalTrackerSchema);
export const validateRenewalTrackerIdParam = validateParams(zodRenewalTrackerIdParamSchema);
export const validateRenewalTrackerAndManagerIdParam = validateParams(
  zodRenewalTrackerAndManagerIdParamSchema
);
