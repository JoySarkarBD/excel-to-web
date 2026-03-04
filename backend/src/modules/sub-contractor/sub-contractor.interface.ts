/**
 * SubContractor Module — Type definitions.
 *
 * Used for both Transport Manager and Standalone User roles.
 * Fields mirror the SubContractor Mongoose schema.
 */
export interface TSubContractor {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  gitPolicyNumber?: string;
  gitExpiryDate?: string;
  gitCoverPerTonne?: number;
  hiabAvailable?: boolean;
  otherCapabilities?: string;
  startDateOfAgreement: string;
  rating?: number;
  checkedBy: string;
  notes?: string;
  standAloneId?: string;
  createdBy: string;
}