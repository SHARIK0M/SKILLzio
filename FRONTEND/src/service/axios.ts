import axios from "axios";

// Create an Axios instance with default settings
export const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL || "http://localhost:8000", // API base URL from environment or fallback to localhost
  headers: {
    "Content-Type": "application/json", // Default request content type
  },
  withCredentials: true, // Allow sending cookies (important for auth)
});

// Request Interceptor: runs before every request is sent
API.interceptors.request.use(
  (config) => {
    // Retrieve tokens from localStorage
    const verificationToken = localStorage.getItem("verificationToken");
    const verificationTokenStudent = localStorage.getItem(
      "verificationTokenStudent"
    );

    // If both tokens exist, prefer the student token
    const token = verificationTokenStudent || verificationToken;

    // Attach token to request header if available
    if (token) {
      config.headers["the-verify-token"] = token;
    }

    return config; // Continue with updated config
  },
  (error) => {
    // Handle request setup errors
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: runs after every response is received
API.interceptors.response.use(
  (response) => response, // If successful, return response as-is
  (error) => {
    // Handle unauthorized errors (status code 401)
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized: clearing tokens");

      // Clear tokens from localStorage so user must re-authenticate
      localStorage.removeItem("verificationTokenStudent");
      localStorage.removeItem("verificationToken");
    } else {
      // Log any other errors
      console.error("Axios error:", error);
    }

    return Promise.reject(error); // Reject error so calling code can handle it
  }
);
