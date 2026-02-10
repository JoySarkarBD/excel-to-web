import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionInvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Define and export an interface representing a SubscriptionInvoice document
export interface ISubscriptionInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  userSubscriptionId: mongoose.Types.ObjectId;
  invoiceNumber: string; /* Unique invoice ID */
  amount?: number;
  status?: SubscriptionInvoiceStatus;
  dueDate?: Date;
  stripeInvoiceId?: string;
  couponId?: mongoose.Types.ObjectId;
}

// Define the SubscriptionInvoice schema
const SubscriptionInvoiceSchema: Schema<ISubscriptionInvoice> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    userSubscriptionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserSubscription', // Reference to the UserSubscription model
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    } /* Unique invoice ID */,
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionInvoiceStatus),
    },
    dueDate: {
      type: Date, // Due date for the invoice payment
    },
    stripeInvoiceId: {
      type: String,
    }, // ID of the corresponding Stripe invoice (if applicable)
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionCoupon',
    }, // Reference to the SubscriptionCoupon model (optional)
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionInvoice model
const SubscriptionInvoice = mongoose.model<ISubscriptionInvoice>(
  'SubscriptionInvoice',
  SubscriptionInvoiceSchema
);

// Export the SubscriptionInvoice model
export default SubscriptionInvoice;
