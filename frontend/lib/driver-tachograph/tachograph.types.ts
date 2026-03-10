// const DriverTachographSchema: Schema<IDriverTachograph> = new Schema(
//   {
//     driverId: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: "Driver", // Reference from Driver model
//     },
//     vehicleId: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: "Vehicle", // Reference from Vehicle model
//     },
//     typeOfInfringement: {
//       type: String,
//     },
//     details: {
//       type: String,
//     },
//     actionTaken: {
//       type: String,
//     },
//     reviewedBy: {
//       type: Schema.Types.ObjectId,
//       // required: true,
//       ref: "User", // Reference from User model
//     },
//     signed: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true, versionKey: false },
// );

export interface DriverTachographRow {
  _id: string;
  driverId: string;
  driverName?: string;
  vehicleId: string;
  vehicleRegId?: string;
  vehicleType?: string;
  licensePlate?: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy: string;
  reviewedByName?: string;
  signed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverTachographListResponse {
  tachographs: DriverTachographRow[];
  totalData: number;
  totalPages: number;
}

export interface CreateDriverTachographInput {
  driverId: string;
  vehicleId: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy?: string;
  signed?: boolean;
  standAloneId: string;
}

/** Input for standalone users (no standAloneId) */
export interface CreateDriverTachographAsStandAloneInput {
  driverId: string;
  vehicleId: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy?: string;
  signed?: boolean;
}

/** Body for PATCH /vehicle/update-vehicle/:vehicleId/:standAloneId */
export interface UpdateDriverTachographInput {
  id?: string; // used in UI; not sent in PATCH body
  driverId?: string;
  vehicleId?: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy?: string;
  signed?: boolean;
}

/** A driver with their assigned vehicles (from working-time-directive API) */
export interface DriverWithVehicles {
  _id: string;
  fullName: string;
  licenseNumber: string;
  vehicles: {
    _id: string;
    vehicleRegId: string;
    vehicleType: string;
    licensePlate: string;
    status: string;
  }[];
}
