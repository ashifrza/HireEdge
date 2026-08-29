import { api } from "../../../lib/api";

export async function register({ username, email, password }) {
  const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", {
      email,
      password,
    });

  return response.data;
}

export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}

export async function requestOtp({ channel, value }) {
  const response = await api.post("/api/auth/otp/request", { channel, value });
  return response.data;
}

export async function verifyOtp({ channel, value, code }) {
  const response = await api.post("/api/auth/otp/verify", { channel, value, code });
  return response.data;
}

export async function googleAuth(credential) {
  const response = await api.post("/api/auth/google", { credential });
  return response.data;
}
