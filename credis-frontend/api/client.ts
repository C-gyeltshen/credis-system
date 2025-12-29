import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Include cookies with requests
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          error.response?.data?.code === "TOKEN_EXPIRED"
        ) {
          originalRequest._retry = true;

          try {
            // Call refresh endpoint
            await this.client.post("/store-owners/refresh");
            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string) {
    const response = await this.client.get<T>(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any) {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any) {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string) {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }

  async setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async clearAuthToken() {
    delete this.client.defaults.headers.common["Authorization"];
  }
}

export const apiClient = new ApiClient();
