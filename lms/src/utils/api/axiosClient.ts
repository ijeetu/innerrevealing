import axios from "axios";
import { store } from "@/redux/store";
import { logoutSuccess } from "@/redux/reducers/userSlice";

// Browser requests use this application's cookie-authenticated API.
const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 30000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\\)/i.test(config.url || "")) {
    throw new Error("API requests must use the local application API.");
  }
  config.baseURL = "/api";
  config.withCredentials = true;
  // The HTTP-only session cookie proves login; a Redux marker grants no access.
  config.headers.delete("Authorization");
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      store.dispatch(logoutSuccess());
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
