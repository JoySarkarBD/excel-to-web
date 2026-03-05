import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import {
  ClientListResponse,
  CreateClientInput,
} from "@/lib/clients/client.types";
import axios from "axios";

/**
 * Extract the most useful error message from a backend error response.
 * Backend may return: { error: string } | { errors: [...] } | { message: string }
 */
function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  // Service-layer errors: { error: "A user already exists..." }
  if (typeof data.error === "string" && data.error) return data.error;

  // Zod validation errors: { errors: [{ field, message }] }
  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const msgs = (data.errors as { field?: string; message: string }[]).map(
        (e) => (e.field ? `${e.field}: ${e.message}` : e.message),
      );
      return msgs.join(", ");
    }
    if (typeof data.errors === "string") return data.errors;
  }

  // Fallback to general message
  if (data.message && data.message !== "An unexpected error occurred")
    return data.message;

  return "Something went wrong";
}

/**
 * GET /api/v1/client-management/clients
 * Fetches paginated clients for the authenticated Transport Manager.
 */
const getClients = async (params?: {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}): Promise<IApiResponse<ClientListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<ClientListResponse>>(
      `${base_url}/client-management/clients`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          searchKey: params?.searchKey || undefined,
          showPerPage: params?.showPerPage || 10,
          pageNo: params?.pageNo || 1,
        },
      },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * POST /api/v1/client-management/clients
 * Creates a new client user under the authenticated Transport Manager.
 */
const createClient = async (
  data: CreateClientInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/client-management/clients`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

export const ClientAction = {
  getClients,
  createClient,
};
