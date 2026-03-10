/**
 * Types for the Spot Check management page.
 */

/** Shape of a single spot-check returned by the backend */
export interface SpotCheckRow {
  _id: string;
  vehicleId: string;
  issueDetails: string;
  reportedBy?: string;
  rectificationRequired?: string;
  actionTaken?: string;
  dateCompleted?: string;
  completedBy?: string;
  followUpNeeded?: string;
  notes?: string;
  attachments?: string[];
  standAloneId?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response shape from GET /spot-check/get-spot-check/many */
export interface SpotCheckListResponse {
  spotChecks: SpotCheckRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /spot-check/create-spot-check (Transport Manager) */
export interface CreateSpotCheckInput {
  vehicleId: string;
  issueDetails: string;
  standAloneId: string;
  reportedBy?: string;
  rectificationRequired?: string;
  actionTaken?: string;
  dateCompleted?: string;
  completedBy?: string;
  followUpNeeded?: string;
  notes?: string;
  attachments?: string[];
}

/** Body for PATCH /spot-check/update-spot-check/:id/:standAloneId */
export interface UpdateSpotCheckInput {
  vehicleId?: string;
  issueDetails?: string;
  rectificationRequired?: string;
  actionTaken?: string;
  dateCompleted?: string;
  completedBy?: string;
  followUpNeeded?: string;
  notes?: string;
  attachments?: string[];
}
