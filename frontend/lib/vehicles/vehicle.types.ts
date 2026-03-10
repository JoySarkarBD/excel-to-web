/**
 * Types for the Vehicle Management (Vehicle List) page.
 */

export enum VehicleStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum OwnerShipStatus {
  Individual_Ownership = "Individual_Ownership",
  Joint_Ownership = "Joint_Ownership",
  Company_Business_Ownership = "Company/Business_Ownership",
  Leased_Financed = "Leased/Financed",
  Fleet_Management = "Fleet_Management",
}

/** Shape of additionalDetails nested object */
export interface VehicleAdditionalDetails {
  lastServiceDate?: string;
  nextServiceDate?: string;
  grossPlatedWeight: number;
  ownerShipStatus: OwnerShipStatus;
  diskNumber: string;
  dateLeft?: string;
  chassisNumber: string;
  keysAvailable: number;
  v5InName: boolean;
  plantingCertificate: boolean;
  vedExpiry?: string;
  insuranceExpiry?: string;
  serviceDueDate?: string;
}

/** Shape of a single vehicle returned by the backend */
export interface VehicleRow {
  _id: string;
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  status: VehicleStatus;
  additionalDetails: VehicleAdditionalDetails;
  driverPack: boolean;
  notes?: string;
  driverIds: string[];
  standAloneId?: string;
  attachments?: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response shape from GET /vehicle/get-vehicle/many */
export interface VehicleListResponse {
  vehicles: VehicleRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /vehicle/create-vehicle (Transport Manager) */
export interface CreateVehicleInput {
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  status: VehicleStatus;
  additionalDetails: {
    lastServiceDate?: string;
    nextServiceDate?: string;
    grossPlatedWeight: number;
    ownerShipStatus: OwnerShipStatus;
    diskNumber: string;
    dateLeft?: string;
    chassisNumber: string;
    keysAvailable: number;
    v5InName: boolean;
    plantingCertificate: boolean;
    vedExpiry?: string;
    insuranceExpiry?: string;
    serviceDueDate?: string;
  };
  driverPack: boolean;
  notes?: string;
  driverIds: string[];
  standAloneId: string;
}

/** Body for PATCH /vehicle/update-vehicle/:vehicleId/:standAloneId */
export interface UpdateVehicleInput {
  vehicleRegId?: string;
  vehicleType?: string;
  licensePlate?: string;
  status?: VehicleStatus;
  additionalDetails?: {
    lastServiceDate?: string;
    nextServiceDate?: string;
    grossPlatedWeight?: number;
    ownerShipStatus?: OwnerShipStatus;
    diskNumber?: string;
    dateLeft?: string;
    chassisNumber?: string;
    keysAvailable?: number;
    v5InName?: boolean;
    plantingCertificate?: boolean;
    vedExpiry?: string;
    insuranceExpiry?: string;
    serviceDueDate?: string;
  };
  driverPack?: boolean;
  notes?: string;
  driverIds?: string[];
}
