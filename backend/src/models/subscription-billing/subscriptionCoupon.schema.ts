import mongoose, { Document, Schema } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

// Define and export an interface representing a SubscriptionCoupon document
export interface ISubscriptionCoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  usedBy: mongoose.Types.ObjectId[]; // Array of user IDs who have used the coupon
  users: mongoose.Types.ObjectId[]; // Array of user IDs who can use the coupon
  createdBy: mongoose.Types.ObjectId;
}

// Define the SubscriptionCoupon schema
const SubscriptionCouponSchema: Schema<ISubscriptionCoupon> = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
    }, // Unique coupon code
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    }, // Type of discount (percentage or fixed amount)
    discountValue: {
      type: Number,
      required: true,
    }, // Value of the discount
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    }, // Indicates if the coupon is active and can be used
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
      },
    ], // Array of user IDs who have used the coupon
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
      },
    ], // Array of user IDs who can use the coupon
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionCoupon model
const SubscriptionCoupon = mongoose.model<ISubscriptionCoupon>(
  'SubscriptionCoupon',
  SubscriptionCouponSchema
);

// Export the SubscriptionCoupon model
export default SubscriptionCoupon;
