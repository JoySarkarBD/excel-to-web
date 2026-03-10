// For driver tachograph

import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import {
  CreateDriverTachographInput,
  DriverTachographListResponse,
  DriverTachographRow,
  UpdateDriverTachographInput,
} from "@/lib/driver-tachograph/tachograph.types";
import axios from "axios";

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
 * GET /api/v1/driver-tachograph/get-driver-tachograph/many?standAloneId=...
 * Fetches paginated driver tachographs for a specific client (standAloneId).
 *
 * Optional query params:
 * - searchKey: string to search across multiple fields
 * - showPerPage: number of items per page (default 10)
 * - pageNo: page number to fetch (default 1)
 */
const getDriverTachographs = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<DriverTachographListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");
  try {
    const response = await axios.get<
      IApiResponse<DriverTachographListResponse>
    >(`${base_url}/driver-tachograph/get-driver-tachograph/many`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        standAloneId,
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      },
    });
    const raw = response.data as any;
    const rawData = raw?.data;
    const normalizedTachographs = Array.isArray(rawData?.tachographs)
      ? rawData.tachographs
      : Array.isArray(rawData?.driverTachographs)
        ? rawData.driverTachographs
        : [];

    return {
      ...raw,
      data: {
        ...rawData,
        tachographs: normalizedTachographs,
        totalData: rawData?.totalData ?? 0,
        totalPages: rawData?.totalPages ?? 0,
      },
    } as IApiResponse<DriverTachographListResponse>;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/**
 * GET /api/v1/driver-tachograph/get-driver-tachograph/:id?standAloneId=...
 * Fetches a single driver tachograph by ID for a specific client.
 */
const getDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
): Promise<IApiResponse<DriverTachographRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<DriverTachographRow>>(
      `${base_url}/driver-tachograph/get-driver-tachograph/${tachographId}/${standAloneId}`,
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
 * POST /api/v1/driver-tachograph/create-driver-tachograph
 * Creates a new driver tachograph under a specific client (standAloneId in body).
 */
const createDriverTachograph = async (
  data: CreateDriverTachographInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/driver-tachograph/create-driver-tachograph`,
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
 * PATCH /api/v1/driver-tachograph/update-driver-tachograph/:id/:standAloneId
 * Updates a driver tachograph for a specific client.
 */
const updateDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
  data: UpdateDriverTachographInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const { id: _ignoredId, ...updateBody } = data;
    const response = await axios.patch<IApiResponse>(
      `${base_url}/driver-tachograph/update-driver-tachograph/${tachographId}/${standAloneId}`,
      updateBody,
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
 * DELETE /api/v1/driver-tachograph/delete-driver-tachograph/:id/:standAloneId
 * Deletes a driver tachograph for a specific client.
 */
const deleteDriverTachograph = async (
  tachographId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/driver-tachograph/delete-driver-tachograph/${tachographId}/${standAloneId}`,
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

export const DriverTachographAction = {
  getDriverTachographs,
  getDriverTachograph,
  createDriverTachograph,
  updateDriverTachograph,
  deleteDriverTachograph,
};
