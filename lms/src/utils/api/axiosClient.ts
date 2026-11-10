import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { store } from "@/redux/store";
import { logoutSuccess, tokenSelector } from "@/redux/reducers/userSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ENDPOINT = process.env.NEXT_PUBLIC_END_POINT;

const EXTERNAL_API_URL = `${BASE_URL}/${ENDPOINT}`;

const DEFAULT_TIMEOUT = 30000;


const getAuthTokenFromRedux = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Get the current state from Redux store
    const state = store.getState();
    // Use the tokenSelector to get the token from state
    const token = tokenSelector(state);
    return token || null;
  } catch (error) {
    console.error("Error getting auth token from Redux store:", error);
    return null;
  }
};

const axiosConfig: AxiosRequestConfig = {
  baseURL: EXTERNAL_API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
};

const axiosClient: AxiosInstance = axios.create(axiosConfig);


axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers.Authorization) {
      const token = getAuthTokenFromRedux();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const statusCode = error.response?.status;

    switch (statusCode) {
      case 401:
        // NOTE: This will clear the token from Redux store and redirect to login page
        store.dispatch(logoutSuccess());
        break;
      case 403:
        break;
      case 404:
        break;
      case 500:
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
