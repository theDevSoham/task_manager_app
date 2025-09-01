// api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function sendLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return axios.post(`${API_BASE}/login`, { email, password });
}

export async function sendSignup({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return axios.post(`${API_BASE}/register`, {
    email,
    password,
    firstName,
    lastName,
  });
}

export async function verifyOtp({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  return axios.post(`${API_BASE}/otp`, { email, code });
}

export async function fetchTasks(token: string) {
  return axios.get(`${API_BASE}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
