import { API } from "../../service/axios";

// Importing admin API endpoints
import AdminRoutersEndPoints from "../../types/EndPoints/admin.Endpoints";

/**
 * Fetch all users with pagination and search filter
 * @param page - current page number (default = 1)
 * @param limit - number of results per page (default = 1)
 * @param search - optional search string
 */
export const getAllUser = async (
  page = 1,
  limit = 1,
  search = ""
): Promise<any> => {
  try {
    // GET request to fetch users with page, limit and search query params
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetUsers}?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Include cookies for authentication
      }
    );
    console.log("API Call Params =>", { page, limit, search });
    console.log("getAll users in adminAction api", response.data);

    // Return the API response data (expected to contain { users, total })
    return response.data;
  } catch (error) {
    // Throw error so it can be handled by the caller
    throw error;
  }
};

/**
 * Block a specific user by email
 * @param email - email of the user to block
 */
export const blockUser = async (email: string) => {
  try {
    // GET request to block user by passing email in the URL
    const response = await API.get(
      `${AdminRoutersEndPoints.adminBlockUser}/${email}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("block user in adminAction", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all instructors with pagination and search filter
 * @param page - current page number (default = 1)
 * @param limit - number of results per page (default = 1)
 * @param search - optional search string
 */
export const getAllInstructor = async (
  page = 1,
  limit = 1,
  search = ""
): Promise<any> => {
  try {
    // GET request to fetch instructors with page, limit and search query params
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetInstructors}?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Instructor API Call Params =>", { page, limit, search });
    console.log("getAll instructors", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Block a specific instructor by email
 * @param email - email of the instructor to block
 */
export const blockInstructor = async (email: string): Promise<any> => {
  try {
    // GET request to block instructor by passing email in the URL
    const response = await API.get(
      `${AdminRoutersEndPoints.adminBlockInstructor}/${email}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("block instructor", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all instructor verification requests
 * with pagination and search filter
 * @param page - current page number (default = 1)
 * @param limit - number of results per page (default = 1)
 * @param search - optional search string
 */
export const getAllVerificationRequests = async (
  page = 1,
  limit = 1,
  search = ""
): Promise<any> => {
  try {
    // GET request for verification requests with page, limit and search
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetVerifcationsRequest}?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Verification API Call Params =>", { page, limit, search });
    console.log("Verification request response =>", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a specific verification request by email
 * @param email - email of the instructor
 */
export const getVerificationRequestByemail = async (email: string) => {
  try {
    // GET request to fetch verification request for a specific instructor email
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetVerificationByEamil}/${email}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log(
      "get specific verification request in adminAction api",
      response.data
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update the status of an instructor verification request
 * (approve or reject)
 * @param email - email of the instructor
 * @param status - "approved" or "rejected"
 * @param reason - optional rejection reason (required if rejected)
 */
export const updateVerificationStatus = async (
  email: string,
  status: "approved" | "rejected",
  reason?: string
) => {
  try {
    // Prepare the request body with email and status
    const body: { email: string; status: string; reason?: string } = {
      email,
      status,
    };

    // Attach reason only if status is rejected
    if (status === "rejected" && reason) {
      body.reason = reason;
    }

    // POST request to approve/reject verification
    const response = await API.post(
      AdminRoutersEndPoints.adminApproveVerification,
      body,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("approved/rejected request", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};
