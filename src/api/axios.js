import axios from "axios";

const api = axios.create({
  baseURL: "https://agrichain-backend-hbb9.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

/* ================= REQUEST INTERCEPTOR =================
Automatically attach JWT token to every request
======================================================= */

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR =================
Handle authentication failures globally
======================================================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      const status = error.response.status;

      if (status === 401 || status === 403) {

        console.warn("⚠️ Authentication error. Redirecting to login.");

        localStorage.removeItem("token");

        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default api;