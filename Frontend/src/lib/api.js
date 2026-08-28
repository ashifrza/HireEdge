import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let responseMessage = error.response?.data?.message;

    // Download endpoints return blobs, including when the backend sends a JSON
    // error. Decode that JSON so the UI can show the real failure reason.
    if (!responseMessage && error.response?.data instanceof Blob) {
      try {
        const payload = JSON.parse(await error.response.data.text());
        responseMessage = payload?.message;
      } catch {
        // The response was not JSON; use the normal fallback below.
      }
    }

    const message = responseMessage
      || (error.code === "ECONNABORTED" ? "The request timed out. Please try again." : null)
      || "Something went wrong. Please try again.";
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.cause = error;
    return Promise.reject(normalized);
  },
);
