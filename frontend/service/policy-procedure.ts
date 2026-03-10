import { base_url } from "@/lib/utils";
import { IApiResponse } from "./auth";
import { AuthAction } from "./auth";
import {
  CreatePolicyProcedureInput,
  PolicyProcedureListResponse,
  PolicyProcedureRow,
  UpdatePolicyProcedureInput,
} from "@/lib/policy-procedures/policy-procedure.types";
import axios from "axios";

/* ────────── helpers ────────── */

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

/* ────────── GET many ────────── */

const getPolicyProcedures = async (
  standAloneId: string,
  params?: {
    searchKey?: string;
    showPerPage?: number;
    pageNo?: number;
  },
): Promise<IApiResponse<PolicyProcedureListResponse>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<
      IApiResponse<PolicyProcedureListResponse>
    >(`${base_url}/policy-procedure/get-policy-procedures`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        standAloneId,
        searchKey: params?.searchKey || undefined,
        showPerPage: params?.showPerPage || 10,
        pageNo: params?.pageNo || 1,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(extractApiError(error.response?.data));
    }
    throw new Error("Something went wrong");
  }
};

/* ────────── GET single ────────── */

const getPolicyProcedure = async (
  policyProcedureId: string,
  standAloneId: string,
): Promise<IApiResponse<PolicyProcedureRow>> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.get<IApiResponse<PolicyProcedureRow>>(
      `${base_url}/policy-procedure/get-policy-procedure/${policyProcedureId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { standAloneId },
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

/* ────────── POST create ────────── */

const createPolicyProcedure = async (
  data: CreatePolicyProcedureInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/policy-procedure/create-policy-procedure`,
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

/* ────────── PATCH update ────────── */

const updatePolicyProcedure = async (
  policyProcedureId: string,
  standAloneId: string,
  data: UpdatePolicyProcedureInput,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/policy-procedure/update-policy-procedure-by-manager/${policyProcedureId}/${standAloneId}`,
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

/* ────────── DELETE ────────── */

const deletePolicyProcedure = async (
  policyProcedureId: string,
  standAloneId: string,
): Promise<IApiResponse> => {
  const token = AuthAction.GetAuthToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await axios.delete<IApiResponse>(
      `${base_url}/policy-procedure/delete-policy-procedure-by-manager/${policyProcedureId}/${standAloneId}`,
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

export const PolicyProcedureAction = {
  getPolicyProcedures,
  getPolicyProcedure,
  createPolicyProcedure,
  updatePolicyProcedure,
  deletePolicyProcedure,
};
