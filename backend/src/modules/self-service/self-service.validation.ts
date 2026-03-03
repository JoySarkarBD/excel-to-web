import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Self-service Validation Schemas and Types
 *
 * This module defines Zod schemas for validating self-service related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single self-service.
 *
 */

// base fields for creation
const baseSelfServiceFields = {
  serviceName: z
    .string({ message: 'Service name is required' })
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be at most 100 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  serviceLink: z.string().url({ message: 'Service link must be a valid URL' }).optional(),
};

/**
 * Transport Manager created: standAloneId is REQUIRED
 */
const zodCreateSelfServiceAsManagerSchema = z
  .object({
    ...baseSelfServiceFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateSelfServiceAsManagerInput = z.infer<typeof zodCreateSelfServiceAsManagerSchema>;

/**
 * Standalone created: no standAloneId
 */

const zodCreateSelfServiceAsStandAloneSchema = z
  .object({
    ...baseSelfServiceFields,
  })
  .strict();

export type CreateSelfServiceAsStandAloneInput = z.infer<
  typeof zodCreateSelfServiceAsStandAloneSchema
>;

export type CreateSelfServiceInput =
  | CreateSelfServiceAsStandAloneInput
  | CreateSelfServiceAsManagerInput;

/**
 * Zod schema for validating data when **updating** an existing self-service.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateSelfServiceSchema = z
  .object({
    serviceName: z
      .string({ message: 'Service name is required' })
      .min(2, 'Service name must be at least 2 characters')
      .max(100, 'Service name must be at most 100 characters')
      .optional(),
    description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
    serviceLink: z.string().url({ message: 'Service link must be a valid URL' }).optional(),
  })
  .strict();

export type UpdateSelfServiceInput = z.infer<typeof zodUpdateSelfServiceSchema>;

// for validating search query parameters when retrieving multiple self-services
const zodSearchSelfServiceSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    })
    .optional(),
});

export type SearchSelfServiceQueryInput = z.infer<typeof zodSearchSelfServiceSchema>;

// for validating the :id param in routes like GET /self-service/:id, PUT /self-service/:id, DELETE /self-service/:id
const zodSelfServiceIdParamSchema = z
  .object({
    id: z.string({ message: 'Self service id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();

export type SelfServiceIdParamInput = z.infer<typeof zodSelfServiceIdParamSchema>;

// for validating the :id and :standAloneId params in routes like GET /self-service/:id/:standAloneId, PUT /self-service/:id/:standAloneId, DELETE /self-service/:id/:standAloneId
const zodSelfServiceAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'Self service id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for self service id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

export type SelfServiceAndManagerIdParamInput = z.infer<
  typeof zodSelfServiceAndManagerIdParamSchema
>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSelfServiceAsManager = validateBody(zodCreateSelfServiceAsManagerSchema);
export const validateCreateSelfServiceAsStandAlone = validateBody(
  zodCreateSelfServiceAsStandAloneSchema
);
export const validateUpdateSelfService = validateBody(zodUpdateSelfServiceSchema);
export const validateSearchSelfServiceQueries = validateQuery(zodSearchSelfServiceSchema);
export const validateSelfServiceIdParam = validateParams(zodSelfServiceIdParamSchema);
export const validateSelfServiceAndManagerIdParam = validateParams(
  zodSelfServiceAndManagerIdParamSchema
);

