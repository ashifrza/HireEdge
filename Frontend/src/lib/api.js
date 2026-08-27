import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
      || (error.code === "ECONNABORTED" ? "The request timed out. Please try again." : null)
      || "Something went wrong. Please try again.";
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.cause = error;
    return Promise.reject(normalized);
  },
);
