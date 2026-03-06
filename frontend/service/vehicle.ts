import axios from "axios";
import { base_url } from "@/lib/utils";
import { IApiResponse, AuthAction } from "./auth";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListResponse,
  VehicleRow,
} from "@/lib/vehicles/vehicle.types";

/**
 * Extract the most useful error message from a backend error response.
 */
function extractApiError(data: IApiResponse | undefined): string {
  if (!data) return "Something went wrong";

  if (typeof data.error === "string" && data.error) return data.error;

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      const msgs = (data.errors as { field?: string; message: string }[]).map(
        (e) => (e.field ? `${e.field}: ${e.message}` : e.message),
      );
      return msgs.join(", ");
    }
    if (typeof data.errors === "string") return data.errors;
  }

  if (data.message && data.message !== "An unexpected error occurred")
    return data.message;

  return "Something went wrong";
}

/**
 * GET /api/v1/vehicle/get-vehicle/many?standAloneId=...
 * Fetches paginated vehicles for a specific client (standAloneId).
 */
const getVehicles = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<VehicleListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<VehicleListResponse>>(
      `${base_url}/vehicle/get-vehicle/many`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          standAloneId,
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
 * GET /api/v1/vehicle/get-vehicle/:id/:standAloneId
 * Fetches a single vehicle by ID for a specific client.
 */
const getVehicle = async (
  vehicleId: string,
  standAloneId: string,
): Promise<IApiResponse<VehicleRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<VehicleRow>>(
      `${base_url}/vehicle/get-vehicle/${vehicleId}/${standAloneId}`,
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

/**
 * POST /api/v1/vehicle/create-vehicle
 * Creates a new vehicle under a specific client (standAloneId in body).
 */
const createVehicle = async (
  data: CreateVehicleInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/vehicle/create-vehicle`,
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

/**
 * PATCH /api/v1/vehicle/update-vehicle/:vehicleId/:standAloneId
 * Updates a vehicle by ID for a specific client.
 */
const updateVehicle = async (
  vehicleId: string,
  standAloneId: string,
  data: UpdateVehicleInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/vehicle/update-vehicle/${vehicleId}/${standAloneId}`,
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

/**
 * DELETE /api/v1/vehicle/delete-vehicle/:vehicleId/:standAloneId
 * Deletes a vehicle by ID for a specific client.
 */
const deleteVehicle = async (
  vehicleId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/vehicle/delete-vehicle/${vehicleId}/${standAloneId}`,
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

export const VehicleAction = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
