/**
 * Renewal Tracker Types
 */

export enum RenewalTrackerStatus {
  ACTIVE = "Active",
  SCHEDULED = "Scheduled",
  DUE_SOON = "Due Soon",
  EXPIRED = "Expired",
}

export interface RenewalTrackerRow {
  _id: string;
  type: string;
  item: string;
  description?: string;
  refOrPolicyNo?: string;
  refOrPolicyNoName?: string;
  responsiblePerson?: string;
  responsiblePersonName?: string;
  providerOrIssuer?: string;
  startDate?: string;
  expiryOrDueDate?: string;
  reminderSet?: boolean;
  reminderDate?: string;
  status?: RenewalTrackerStatus;
  notes?: string;
  standAloneId?: string;
  createdBy: string;
}

export interface CreateRenewalTrackerInput {
  type: string;
  item: string;
  description?: string;
  refOrPolicyNo?: string;
  responsiblePerson?: string;
  providerOrIssuer?: string;
  startDate?: string;
  expiryOrDueDate?: string;
  reminderSet?: boolean;
  reminderDate?: string;
  status?: RenewalTrackerStatus;
  notes?: string;
  standAloneId: string;
}

export interface CreateRenewalTrackerAsStandAloneInput {
  type: string;
  item: string;
  description?: string;
  refOrPolicyNo?: string;
  responsiblePerson?: string;
  providerOrIssuer?: string;
  startDate?: string;
  expiryOrDueDate?: string;
  reminderSet?: boolean;
  reminderDate?: string;
  status?: RenewalTrackerStatus;
  notes?: string;
}

export interface UpdateRenewalTrackerInput {
  type?: string;
  item?: string;
  description?: string;
  refOrPolicyNo?: string;
  responsiblePerson?: string;
  providerOrIssuer?: string;
  startDate?: string;
  expiryOrDueDate?: string;
  reminderSet?: boolean;
  reminderDate?: string;
  status?: RenewalTrackerStatus;
  notes?: string;
}

export interface UpdateRenewalTrackerAsStandAloneInput {
  type?: string;
  item?: string;
  description?: string;
  refOrPolicyNo?: string;
  responsiblePerson?: string;
  providerOrIssuer?: string;
  startDate?: string;
  expiryOrDueDate?: string;
  reminderSet?: boolean;
  reminderDate?: string;
  status?: RenewalTrackerStatus;
  notes?: string;
}
