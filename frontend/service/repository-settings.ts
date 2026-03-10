import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { RepositorySettingsFlags } from "@/lib/repository/repository.types";
import axios from "axios";
import { AuthAction } from "./auth";

/**
 * GET /api/v1/repository-settings
 * Returns all 21 boolean flags for the authenticated user.
 */
const getSettings = async (): Promise<IApiResponse<RepositorySettingsFlags>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<RepositorySettingsFlags>>(
      `${base_url}/repository-settings`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

/**
 * PATCH /api/v1/repository-settings
 * Sends partial boolean flags to update.
 */
const updateSettings = async (
  data: Partial<RepositorySettingsFlags>,
): Promise<IApiResponse<RepositorySettingsFlags>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse<RepositorySettingsFlags>>(
      `${base_url}/repository-settings`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }
};

export const RepositorySettingsAction = {
  getSettings,
  updateSettings,
};
