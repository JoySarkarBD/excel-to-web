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
  vehicleId: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy: string;
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
