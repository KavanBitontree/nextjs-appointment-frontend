import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* ============================
   Axios Instances
============================ */

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* ============================
   Refresh Control
============================ */

let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token!);
  });
  failedQueue = [];
};

/* ============================
   Request Interceptor
============================ */

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const url = config.url ?? "";

  if (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/signup")
  ) {
    return config;
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ============================
   Response Interceptor
============================ */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest.url ?? "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/signup");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post("/auth/refresh");
        const { access_token } = data;

        localStorage.setItem("access_token", access_token);
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access_token}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/* ============================
   Helpers
============================ */

export const clearAuthData = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};
