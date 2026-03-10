/** Shape returned by the backend for a single policy procedure */
export interface PolicyProcedureRow {
  _id: string;
  policyName: string;
  policyCategory: string;
  fileLocations: string[];
  versionNumber: number;
  effectiveDate: string;
  reviewFrequencyMonths?: number;
  lastReviewDate?: string;
  responsiblePerson: string;
  notesActionsNeeded?: string;
  nextReviewDue?: string;
  reviewStatus: string;
  type: string;
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated list response from GET /get-policy-procedures */
export interface PolicyProcedureListResponse {
  policyProcedures: PolicyProcedureRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /create-policy-procedure (TM) */
export interface CreatePolicyProcedureInput {
  policyName: string;
  policyCategory: string;
  fileLocations: string[];
  versionNumber: number;
  effectiveDate: string; // ISO datetime
  reviewFrequencyMonths?: number;
  lastReviewDate?: string; // ISO datetime
  responsiblePerson: string;
  notesActionsNeeded?: string;
  nextReviewDue?: string; // ISO datetime
  reviewStatus: string;
  type: string;
  standAloneId: string;
}

/** Body for PATCH /update-policy-procedure-by-manager/:id/:standAloneId */
export interface UpdatePolicyProcedureInput {
  policyName?: string;
  policyCategory?: string;
  fileLocations?: string[];
  versionNumber?: number;
  effectiveDate?: string;
  reviewFrequencyMonths?: number;
  lastReviewDate?: string;
  responsiblePerson?: string;
  notesActionsNeeded?: string;
  nextReviewDue?: string;
  reviewStatus?: string;
  type?: string;
}
