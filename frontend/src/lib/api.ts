// Axios klient — JWT interceptor, 401 da logout.

import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";

// VITE_API_URL build vaqtida o'rnatiladi (Railway: https://api.legogamezone.uz).
// Bo'lmasa same-origin "/api" — dev'da Vite proxy, prod'da bir domenda joylashganda.
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ error?: string }>) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      // /login ga yo'naltirish UI ProtectedRoute orqali bajariladi
    }
    return Promise.reject(err);
  },
);

// Backend xatolarini foydalanuvchi tushunadigan matnga aylantirish
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: string; issues?: { path: string; message: string }[] }
      | undefined;
    if (data?.issues?.length) {
      return data.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
    }
    if (data?.error) return data.error;
    if (err.code === "ERR_NETWORK") return "Server bilan bog'lana olmadik";
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Noma'lum xato";
}
