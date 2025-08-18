import { API } from "../../service/axios";

// Importing admin API endpoints
import AdminRoutersEndPoints from "../../types/EndPoints/admin.Endpoints";

// Fetch all users with pagination and search filter
export const getAllUser = async (
  page = 1,
  limit = 1,
  search = ""
): Promise<any> => {
  try {
    // Make GET request to fetch users with page, limit and search query params
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetUsers}?page=${page}&limit=${limit}&search=${search}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // include cookies for authentication
      }
    );
    console.log("API Call Params =>", { page, limit, search });
    console.log("getAll users in adminAction api", response.data);
    return response.data; // Response contains { users, total }
  } catch (error) {
    throw error; // Propagate error for handling outside
  }
};

// Block a user by email
export const blockUser = async (email: string) => {
  try {
    // GET request to block user endpoint with email param
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

// Fetch all instructors with pagination and search filter
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
    console.log("getall instructors", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Block an instructor by email
export const blockInstructor = async (email: string): Promise<any> => {
  try {
    // GET request to block instructor endpoint with email param
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

// Fetch all verification requests with pagination and search filter
export const getAllVerificationRequests = async (
  page = 1,
  limit = 1,
  search = ""
): Promise<any> => {
  try {
    // GET request for verification requests with page, limit, and search query params
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

// Get a specific verification request by user email
export const getVerificationRequestByemail = async (email: string) => {
  try {
    // GET request to fetch verification request for a specific email
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetVerificationByEamil}/${email}`,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log(
      "getspecific verification request in adminAction api",
      response.data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update the status of a verification request (approve or reject)
export const updateVerificationStatus = async (
  email: string,
  status: "approved" | "rejected",
  reason?: string // Optional reason, required if rejected
) => {
  try {
    // Prepare the request body with email and status
    const body: { email: string; status: string; reason?: string } = {
      email,
      status,
    };

    // Attach reason only if the status is rejected and reason is provided
    if (status === "rejected" && reason) {
      body.reason = reason;
    }

    // POST request to approve/reject verification endpoint with body
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
