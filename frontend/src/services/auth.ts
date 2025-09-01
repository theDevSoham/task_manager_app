/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const response = await axiosClient.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
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
  try {
    const response = await axiosClient.post("/signup", {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

export async function verifyOtp({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  try {
    const response = await axiosClient.post("/signup/verify_otp", {
      email,
      code,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}

export async function resendOtpRequest({ email }: { email: string }) {
  try {
    const response = await axiosClient.post("/signup/verify_otp/resend", {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
