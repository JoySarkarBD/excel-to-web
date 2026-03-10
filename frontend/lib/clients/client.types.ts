/**
 * Types for the Client Management (Users) page.
 */

/** Shape of a single client row returned by GET /client-management/clients */
export interface ClientRow {
  clientId: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  client: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/** Paginated response shape from the GET endpoint */
export interface ClientListResponse {
  data: ClientRow[];
  totalData: number;
  totalPages: number;
}

/** Body for POST /client-management/clients */
export interface CreateClientInput {
  fullName: string;
  email: string;
}
