import mongoose, { Document, Schema } from 'mongoose';

// communication types
export enum CommunicationType {
  Email = 'Email',
  PhoneCall = 'Phone Call',
  Letter = 'Letter',
}

// Define and export an interface representing a TrafficCommissionerCommunication document
export interface ITrafficCommissionerCommunication extends Document {
  type: CommunicationType;
  contactedPerson: string;
  reason: string;
  communicationDate: Date;
  attachments?: mongoose.Types.ObjectId[];
  comments?: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

// Define the TrafficCommissionerCommunication schema
const TrafficCommissionerCommunicationSchema: Schema<ITrafficCommissionerCommunication> =
  new Schema(
    {
      type: {
        type: String,
        enum: Object.values(CommunicationType),
        required: true,
      } /* Type of communication */,
      contactedPerson: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      communicationDate: {
        type: Date,
        required: true,
      },
      attachments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Document', // Reference from Document model
        },
      ],
      comments: {
        type: String,
      },
      standAloneId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference from User model
      },
    },
    { timestamps: true, versionKey: false }
  );

// Create the TrafficCommissionerCommunication model
const TrafficCommissionerCommunication = mongoose.model<ITrafficCommissionerCommunication>(
  'TrafficCommissionerCommunication',
  TrafficCommissionerCommunicationSchema
);

// Export the TrafficCommissionerCommunication model
export default TrafficCommissionerCommunication;
