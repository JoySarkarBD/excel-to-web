import { axiosInstance } from "@/lib/utils/axiosInstance";
import { base_url } from "@/lib/utils";
import {
  CreateRenewalTrackerAsStandAloneInput,
  CreateRenewalTrackerInput,
  RenewalTrackerRow,
  UpdateRenewalTrackerAsStandAloneInput,
  UpdateRenewalTrackerInput,
} from "@/lib/renewal-tracker/renewal-tracker.types";

interface RenewalTrackerResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: RenewalTrackerRow;
}

interface RenewalTrackersListResponse {
  status: boolean;
  statusCode?: number;
  message: string;
  data?: {
    renewalTrackers: RenewalTrackerRow[];
    totalData: number;
    totalPages: number;
  };
}

interface SearchParams {
  searchKey?: string;
  showPerPage?: number;
  pageNo?: number;
}

export const RenewalTrackerAction = {
  /**
   * Create a renewal tracker as transport manager
   */
  async createRenewalTracker(
    data: CreateRenewalTrackerInput,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.post(
        `${base_url}/renewal-tracker/create-renewal-tracker`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to create renewal tracker",
      };
    }
  },

  /**
   * Create a renewal tracker as standalone user
   */
  async createRenewalTrackerAsStandAlone(
    data: CreateRenewalTrackerAsStandAloneInput,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.post(
        `${base_url}/renewal-tracker/create-stand-alone-renewal-tracker`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to create renewal tracker",
      };
    }
  },

  /**
   * Get all renewal trackers for a client (transport manager)
   */
  async getRenewalTrackers(
    standAloneId: string,
    params?: SearchParams,
  ): Promise<RenewalTrackersListResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/renewal-tracker/get-renewal-tracker/many`,
        {
          params: {
            standAloneId,
            ...params,
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch renewal trackers",
      };
    }
  },

  /**
   * Get all renewal trackers (standalone user)
   */
  async getRenewalTrackersAsStandAlone(
    params?: SearchParams,
  ): Promise<RenewalTrackersListResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/renewal-tracker/get-renewal-tracker/many`,
        { params },
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch renewal trackers",
      };
    }
  },

  /**
   * Get a single renewal tracker by ID (transport manager)
   */
  async getRenewalTracker(
    id: string,
    standAloneId: string,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/renewal-tracker/get-renewal-tracker/${id}/${standAloneId}`,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch renewal tracker",
      };
    }
  },

  /**
   * Get a single renewal tracker by ID (standalone user)
   */
  async getRenewalTrackerAsStandAlone(
    id: string,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.get(
        `${base_url}/renewal-tracker/get-renewal-tracker/${id}`,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch renewal tracker",
      };
    }
  },

  /**
   * Update a renewal tracker (transport manager)
   */
  async updateRenewalTracker(
    id: string,
    standAloneId: string,
    data: UpdateRenewalTrackerInput,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.patch(
        `${base_url}/renewal-tracker/update-renewal-tracker/${id}/${standAloneId}`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update renewal tracker",
      };
    }
  },

  /**
   * Update a renewal tracker (standalone user)
   */
  async updateRenewalTrackerAsStandAlone(
    id: string,
    data: UpdateRenewalTrackerAsStandAloneInput,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.patch(
        `${base_url}/renewal-tracker/update-renewal-tracker/${id}`,
        data,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update renewal tracker",
      };
    }
  },

  /**
   * Delete a renewal tracker (transport manager)
   */
  async deleteRenewalTracker(
    id: string,
    standAloneId: string,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.delete(
        `${base_url}/renewal-tracker/delete-renewal-tracker/${id}/${standAloneId}`,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete renewal tracker",
      };
    }
  },

  /**
   * Delete a renewal tracker (standalone user)
   */
  async deleteRenewalTrackerAsStandAlone(
    id: string,
  ): Promise<RenewalTrackerResponse> {
    try {
      const response = await axiosInstance.delete(
        `${base_url}/renewal-tracker/delete-renewal-tracker/${id}`,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return {
        status: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete renewal tracker",
      };
    }
  },
};
