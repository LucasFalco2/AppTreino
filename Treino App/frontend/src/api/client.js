import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "/api";

export const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
export const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api(?:\/.*)?$/i, "")
  : window.location.origin;

export function mediaUrl(value) {
  if (!value) return "";
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
