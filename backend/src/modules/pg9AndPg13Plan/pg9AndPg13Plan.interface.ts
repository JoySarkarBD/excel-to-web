/**
 * PG9 & PG13 Plan Module — Type definitions.
 *
 * Used for both Transport Manager and Standalone User roles.
 * Fields mirror the pg9AndPg13Plan Mongoose schema.
 */
export interface TPg9AndPg13Plan {
  vehicleId: string;
  issueType: string;
  defectDescription?: string;
  clearanceStatus?: string;
  tcContactMade?: boolean;
  maintenanceProvider?: string;
  meetingDate?: string;
  notes?: string;
  followUp?: boolean;
  standAloneId?: string;
  createdBy: string;
}