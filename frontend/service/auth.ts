
import { base_url } from "@/lib/utils";
import axios from "axios";
import Cookies from "js-cookie";

export interface IRegister {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}
export interface ILogin {
  email:string,
  password:string
}

export interface ILoginResponseData {
  token: string;
  [key: string]: unknown;
}

export interface IApiResponse<T = unknown> {
  success?: boolean;
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string | Record<string, string>;
  errors?:string
}

export interface IVerifyEamil {
  email:string;
  token:string
}
export interface IResendEmail {
  email:string
}


export interface  IResetForgetPassword {
  email:string;
  token:string;
  password:string;
  confirmPassword:string
}

const RegisterUser = async (data: IRegister): Promise<IApiResponse> => {
  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/register`,
      data,
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


const LoginUser = async(
  data: ILogin,
): Promise<IApiResponse<ILoginResponseData>> => {
  try {
  const response = await axios.post<IApiResponse<ILoginResponseData>>(
      `${base_url}/auth/login`,
      data,
    );

  return response.data
    
  } catch (error) {
      if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong",
      );
    }
    throw new Error("Something went wrong");
  }

}


const VerifyEmail = async(data:IVerifyEamil)=>{
    try {
    const response = await axios.patch<IApiResponse>(
      `${base_url}/auth/verify-email`,
      data,
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
}

const ResendVerificationEmail = async(data:IResendEmail)=>{
      try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/resend-verification-email`,
      data,
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

}
const ForgotPassword = async(data:IResendEmail)=>{
      try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/forget-password`,
      data,
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

}
const ResetForgetPassword = async(data:IResetForgetPassword)=>{
      try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/reset-password`,
      data,
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

}

const GetAuthToken = (): string | null => {
  return Cookies.get("token") || null;
};
const RemoveAuthToken = (): void => {
  Cookies.remove("token");
};
const LogOut = async (): Promise<IApiResponse> => {
  const token = GetAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post<IApiResponse>(
      `${base_url}/auth/logout`,
      {}, // usually no body needed for logout
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    //  Remove token after successful logout
    Cookies.remove("token", { path: "/" });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<IApiResponse>(error)) {
      const apiError = error.response?.data?.error;
      throw new Error(
        typeof apiError === "string" ? apiError : "Something went wrong"
      );
    }
    throw new Error("Something went wrong");
  }
};
export const AuthAction = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ResendVerificationEmail,
  ForgotPassword,
  ResetForgetPassword,
  GetAuthToken,
  RemoveAuthToken,
  LogOut,
};
