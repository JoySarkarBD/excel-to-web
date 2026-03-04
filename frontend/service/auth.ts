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

export const AuthAction = {
  RegisterUser,
  LoginUser
};
