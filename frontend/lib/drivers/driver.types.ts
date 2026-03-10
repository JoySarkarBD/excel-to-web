/**
 * Types for the Driver Management (Driver Details) page.
 */

export enum CheckStatus {
  OKAY = "Okay",
  DUE = "Due",
}

/** Shape of a single driver returned by the backend */
export interface DriverRow {
  _id: string;
  fullName: string;
  licenseNumber: string;
  postCode: string;
  niNumber: string;
  licenseExpiry?: string;
  licenseExpiryDTC?: string;
  cpcExpiry?: string;
  points: number;
  endorsementCodes: string[];
  lastChecked?: string;
  checkFrequencyDays: number;
  nextCheckDueDate: string;
  employed: boolean;
  checkStatus?: CheckStatus;
  attachments?: string[];
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response shape from GET /driver/get-drivers */
export interface DriverListResponse {
  drivers: DriverRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /driver/create-driver (Transport Manager) */
export interface CreateDriverInput {
  fullName: string;
  licenseNumber: string;
  postCode: string;
  niNumber: string;
  nextCheckDueDate: string;
  points: number;
  checkFrequencyDays: number;
  employed: boolean;
  standAloneId: string;
  licenseExpiry?: string;
  licenseExpiryDTC?: string;
  cpcExpiry?: string;
  endorsementCodes?: string[];
  lastChecked?: string;
  checkStatus?: CheckStatus;
}

/** Body for PATCH /driver/update-driver-by-manager/:driverId/:standAloneId */
export interface UpdateDriverInput {
  fullName?: string;
  licenseNumber?: string;
  postCode?: string;
  niNumber?: string;
  nextCheckDueDate?: string;
  points?: number;
  checkFrequencyDays?: number;
  employed?: boolean;
  licenseExpiry?: string;
  licenseExpiryDTC?: string;
  cpcExpiry?: string;
  endorsementCodes?: string[];
  lastChecked?: string;
  checkStatus?: CheckStatus;
}
