import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    return typeof detail === "string" ? detail : error.message;
  }
  return error instanceof Error ? error.message : "Request failed";
}

export function setApiAccessToken(token?: string): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}
