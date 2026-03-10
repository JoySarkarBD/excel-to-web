import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a DriverTachograph document
export interface IDriverTachograph extends Document {
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy: mongoose.Types.ObjectId;
  signed?: boolean;
  createdBy: mongoose.Types.ObjectId;
  standAloneId: mongoose.Types.ObjectId;
}

// Define the DriverTachograph schema
const DriverTachographSchema: Schema<IDriverTachograph> = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Driver', // Reference from Driver model
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Reference from Vehicle model
    },
    typeOfInfringement: {
      type: String,
    },
    details: {
      type: String,
    },
    actionTaken: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      // required: true,
      ref: 'User', // Reference from User model
    },
    signed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference from User model
    },
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference from User model
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the DriverTachograph model
const DriverTachograph = mongoose.model<IDriverTachograph>(
  'DriverTachograph',
  DriverTachographSchema
);

// Export the DriverTachograph model
export default DriverTachograph;
