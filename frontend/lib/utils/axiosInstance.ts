import axios from "axios";
import { AuthAction } from "@/service/auth";

// Create an axios instance that automatically attaches the auth token if available
export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthAction.GetAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
