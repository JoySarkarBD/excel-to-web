import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { DiscountType } from '../../models';

/**
 * Subscription-coupon Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscription-coupon related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a new subscription-coupon.
 */
const zodCreateSubscriptionCouponSchema = z
  .object({
    code: z.string().min(1, 'Code is required'),
    discountType: z.enum(DiscountType, {
      message: 'Discount type is required and must be either "percentage" or "fixed"',
    }),
    discountValue: z.number({ message: 'Discount value is required' }),
    isActive: z.boolean().optional(),
    subscriptionPricings: z
      .array(
        z.string().refine(isMongoId, {
          message: 'Subscription pricing ID must be a valid MongoDB ObjectId',
        })
      )
      .optional(),
    users: z
      .array(
        z.string().refine(isMongoId, { message: 'Each user ID must be a valid MongoDB ObjectId' })
      )
      .optional(),
  })
  .strict();

export type CreateSubscriptionCouponInput = z.infer<typeof zodCreateSubscriptionCouponSchema>;

/**
 * Zod schema for validating data when **updating** an existing subscription-coupon.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateSubscriptionCouponSchema = zodCreateSubscriptionCouponSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateSubscriptionCouponInput = z.infer<typeof zodUpdateSubscriptionCouponSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubscriptionCoupon = validateBody(zodCreateSubscriptionCouponSchema);
export const validateUpdateSubscriptionCoupon = validateBody(zodUpdateSubscriptionCouponSchema);
