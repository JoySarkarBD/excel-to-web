/**
 * Types for the Sub-Contractor management page.
 */

/** Shape of a single sub-contractor returned by the backend */
export interface SubContractorRow {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  gitPolicyNumber?: string;
  gitExpiryDate?: string;
  gitCoverPerTonne?: number;
  hiabAvailable: boolean;
  otherCapabilities?: string;
  startDateOfAgreement: string;
  rating?: number;
  checkedBy: string;
  notes?: string;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response shape from GET /sub-contractor/get-sub-contractors */
export interface SubContractorListResponse {
  subContractors: SubContractorRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /sub-contractor/create-sub-contractor (Transport Manager) */
export interface CreateSubContractorInput {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  startDateOfAgreement: string;
  checkedBy: string;
  hiabAvailable?: boolean;
  gitPolicyNumber?: string;
  gitExpiryDate?: string;
  gitCoverPerTonne?: number;
  otherCapabilities?: string;
  rating?: number;
  notes?: string;
  standAloneId: string;
}

/** Body for PATCH /sub-contractor/update-sub-contractor-by-manager/:id/:standAloneId */
export interface UpdateSubContractorInput {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  gitPolicyNumber?: string;
  gitExpiryDate?: string;
  gitCoverPerTonne?: number;
  hiabAvailable?: boolean;
  otherCapabilities?: string;
  startDateOfAgreement?: string;
  rating?: number;
  checkedBy?: string;
  notes?: string;
}
