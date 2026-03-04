import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * SubContractor Validation Schemas
 *
 * Supports both Transport Manager and Standalone User roles.
 * Fields: companyName, contactPerson, phone, email, insurancePolicyNumber,
 *         insuranceExpiryDate, gitPolicyNumber, gitExpiryDate, gitCoverPerTonne,
 *         hiabAvailable, otherCapabilities, startDateOfAgreement, rating,
 *         checkedBy, notes
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single subContractorId param */
const zodSubContractorIdParamSchema = z
  .object({
    subContractorId: z
      .string({ message: 'SubContractor id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type SubContractorIdParamInput = z.infer<typeof zodSubContractorIdParamSchema>;

/** TM: subContractorId + standAloneId params */
const zodSubContractorAndManagerIdParamSchema = z
  .object({
    subContractorId: z
      .string({ message: 'SubContractor id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for subContractorId' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type SubContractorAndManagerIdParamInput = z.infer<typeof zodSubContractorAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base sub-contractor fields (shared between TM and standalone create) */
const baseSubContractorFields = {
  companyName: z
    .string({ message: 'Company name is required' })
    .min(1, 'Company name must be at least 1 character')
    .max(200, 'Company name must not exceed 200 characters'),
  contactPerson: z
    .string({ message: 'Contact person is required' })
    .min(1, 'Contact person must be at least 1 character')
    .max(150, 'Contact person must not exceed 150 characters'),
  phone: z
    .string({ message: 'Phone number is required' })
    .min(1, 'Phone number must be at least 1 character')
    .max(30, 'Phone number must not exceed 30 characters'),
  email: z
    .string({ message: 'Email is required' })
    .email({ message: 'Please provide a valid email address' }),
  insurancePolicyNumber: z
    .string({ message: 'Insurance policy number is required' })
    .min(1, 'Insurance policy number must be at least 1 character')
    .max(100, 'Insurance policy number must not exceed 100 characters'),
  insuranceExpiryDate: z
    .string({ message: 'Insurance expiry date is required' })
    .datetime({ message: 'Insurance expiry date must be a valid ISO date string' }),
  gitPolicyNumber: z
    .string({ message: 'GIT policy number must be a string' })
    .max(100, 'GIT policy number must not exceed 100 characters')
    .optional(),
  gitExpiryDate: z
    .string({ message: 'GIT expiry date must be a string' })
    .datetime({ message: 'GIT expiry date must be a valid ISO date string' })
    .optional(),
  gitCoverPerTonne: z
    .number({ message: 'GIT cover per tonne must be a number' })
    .nonnegative('GIT cover per tonne must be a non-negative number')
    .optional(),
  hiabAvailable: z
    .boolean({ message: 'HIAB available must be a boolean' })
    .optional(),
  otherCapabilities: z
    .string({ message: 'Other capabilities must be a string' })
    .max(500, 'Other capabilities must not exceed 500 characters')
    .optional(),
  startDateOfAgreement: z
    .string({ message: 'Start date of agreement is required' })
    .datetime({ message: 'Start date of agreement must be a valid ISO date string' }),
  rating: z
    .number({ message: 'Rating must be a number' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  checkedBy: z
    .string({ message: 'Checked by is required' })
    .min(1, 'Checked by must be at least 1 character')
    .max(150, 'Checked by must not exceed 150 characters'),
  notes: z
    .string({ message: 'Notes must be a string' })
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateSubContractorAsManagerSchema = z
  .object({
    ...baseSubContractorFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateSubContractorAsManagerInput = z.infer<typeof zodCreateSubContractorAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreateSubContractorAsStandAloneSchema = z
  .object({
    ...baseSubContractorFields,
  })
  .strict();

export type CreateSubContractorAsStandAloneInput = z.infer<typeof zodCreateSubContractorAsStandAloneSchema>;

// Legacy union type
export type CreateSubContractorInput = CreateSubContractorAsManagerInput | CreateSubContractorAsStandAloneInput;

/** Update sub-contractor (shared for both roles) — all fields optional, at least 1 required */
const zodUpdateSubContractorSchema = z
  .object({
    companyName: z
      .string({ message: 'Company name must be a string' })
      .min(1, 'Company name must be at least 1 character')
      .max(200, 'Company name must not exceed 200 characters')
      .optional(),
    contactPerson: z
      .string({ message: 'Contact person must be a string' })
      .min(1, 'Contact person must be at least 1 character')
      .max(150, 'Contact person must not exceed 150 characters')
      .optional(),
    phone: z
      .string({ message: 'Phone must be a string' })
      .min(1, 'Phone must be at least 1 character')
      .max(30, 'Phone must not exceed 30 characters')
      .optional(),
    email: z
      .string({ message: 'Email must be a string' })
      .email({ message: 'Please provide a valid email address' })
      .optional(),
    insurancePolicyNumber: z
      .string({ message: 'Insurance policy number must be a string' })
      .max(100, 'Insurance policy number must not exceed 100 characters')
      .optional(),
    insuranceExpiryDate: z
      .string({ message: 'Insurance expiry date must be a string' })
      .datetime({ message: 'Insurance expiry date must be a valid ISO date string' })
      .optional(),
    gitPolicyNumber: z
      .string({ message: 'GIT policy number must be a string' })
      .max(100, 'GIT policy number must not exceed 100 characters')
      .optional(),
    gitExpiryDate: z
      .string({ message: 'GIT expiry date must be a string' })
      .datetime({ message: 'GIT expiry date must be a valid ISO date string' })
      .optional(),
    gitCoverPerTonne: z
      .number({ message: 'GIT cover per tonne must be a number' })
      .nonnegative('GIT cover per tonne must be a non-negative number')
      .optional(),
    hiabAvailable: z
      .boolean({ message: 'HIAB available must be a boolean' })
      .optional(),
    otherCapabilities: z
      .string({ message: 'Other capabilities must be a string' })
      .max(500, 'Other capabilities must not exceed 500 characters')
      .optional(),
    startDateOfAgreement: z
      .string({ message: 'Start date of agreement must be a string' })
      .datetime({ message: 'Start date of agreement must be a valid ISO date string' })
      .optional(),
    rating: z
      .number({ message: 'Rating must be a number' })
      .int('Rating must be an integer')
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5')
      .optional(),
    checkedBy: z
      .string({ message: 'Checked by must be a string' })
      .max(150, 'Checked by must not exceed 150 characters')
      .optional(),
    notes: z
      .string({ message: 'Notes must be a string' })
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateSubContractorInput = z.infer<typeof zodUpdateSubContractorSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchSubContractorsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchSubContractorsQueryInput = z.infer<typeof zodSearchSubContractorsSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateSubContractorIdParam = validateParams(zodSubContractorIdParamSchema);
export const validateSubContractorAndManagerIdParam = validateParams(zodSubContractorAndManagerIdParamSchema);

// Body validators
export const validateCreateSubContractorAsManager = validateBody(zodCreateSubContractorAsManagerSchema);
export const validateCreateSubContractorAsStandAlone = validateBody(zodCreateSubContractorAsStandAloneSchema);
export const validateUpdateSubContractor = validateBody(zodUpdateSubContractorSchema);

// Search query validators
export const validateSearchSubContractorsQueries = validateQuery(zodSearchSubContractorsSchema);