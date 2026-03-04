"use client";
import { base_url } from "@/lib/utils";
import axios from "axios";

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

export interface IApiResponse<T = unknown> {
  success?: boolean;
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
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
      throw new Error(error.response?.data?.error || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }
};


const LoginUser = async(data:ILogin) => {
  try {
  const response = await axios.post<IApiResponse>(
      `${base_url}/auth/login`,
      data,
    );

  return response.data
    
  } catch (error) {
      if (axios.isAxiosError<IApiResponse>(error)) {
      throw new Error(error.response?.data?.error || "Something went wrong");
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
      throw new Error(error.response?.data?.error || "Something went wrong");
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
      throw new Error(error.response?.data?.error || "Something went wrong");
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
      throw new Error(error.response?.data?.error || "Something went wrong");
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
      throw new Error(error.response?.data?.error || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }

}

export const AuthAction = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ResendVerificationEmail,
  ForgotPassword,
  ResetForgetPassword
};
