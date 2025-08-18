import type { userData } from "../../types/userData";
import { API } from "../../service/axios";
import authenticationRoutes from "../../types/EndPoints/auth.Endpoints";

// Admin login function: sends user credentials to login endpoint
export const adminLogin = async (userData: userData): Promise<any> => {
  try {
    // POST request with userData to admin login API
    const response = await API.post(authenticationRoutes.adminLogin, userData, {
      withCredentials: true, // include cookies for authentication
    });

    console.log("admin login response", response.data);

    return response.data; // Return login response data (e.g., tokens, user info)
  } catch (error) {
    throw error; // Propagate error for handling by caller
  }
};

// Admin logout function: calls logout endpoint to clear session
export const adminLogout = async (): Promise<any> => {
  try {
    // POST request with empty body to admin logout API
    const response = await API.post(
      authenticationRoutes.adminLogout,
      {},
      { withCredentials: true } // include cookies to identify session
    );

    console.log("admin logout response", response.data);

    return response.data; // Return logout confirmation from server
  } catch (error) {
    throw error; // Propagate error for handling by caller
  }
};
