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



// Function to fetch all categories with pagination and optional search
export const getAllCategories = async (
  page = 1,   // Default page = 1
  limit = 1,  // Default limit = 1 (number of items per page)
  search = "" // Default empty search keyword
): Promise<any> => {
  try {
    const response = await API.get(
      AdminRoutersEndPoints.adminGetAllCategories, // API endpoint for getting all categories
      {
        params: { page, limit, search }, // Query parameters for pagination and search
        headers: { "Content-Type": "application/json" }, // Request headers
        withCredentials: true, // Send cookies with request for authentication
      }
    );
    return response.data; // Return the response data
  } catch (error) {
    throw error; // Throw error if request fails
  }
};

// Function to fetch a single category by its ID
export const getCategoryById = async (categoryId: string): Promise<any> => {
  try {
    const response = await API.get(
      `${AdminRoutersEndPoints.adminGetCategoryById}/${categoryId}`, // Endpoint with dynamic categoryId
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Fetched category by ID:", response.data);
    return response.data; // Return the category data
  } catch (error) {
    throw error;
  }
};

// Function to add a new category
export const addCategory = async (categoryName: string): Promise<any> => {
  try {
    const response = await API.post(
      AdminRoutersEndPoints.adminCreateCategory, // API endpoint to create category
      { categoryName }, // Request body contains category name
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Category added:", response.data);
    return response.data; // Return the added category data
  } catch (error) {
    throw error;
  }
};

// Function to edit an existing category
export const editCategory = async (
  id: string,            // Category ID
  categoryName: string   // Updated category name
): Promise<any> => {
  try {
    const response = await API.put(
      AdminRoutersEndPoints.adminEditCategory, // API endpoint to edit category
      { id, categoryName }, // Request body with category ID and new name
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Category edited:", response.data);
    return response.data; // Return updated category data
  } catch (error) {
    throw error;
  }
};

// Function to toggle (enable/disable) a category status (list/unlist)
export const toggleCategoryStatus = async (id: string): Promise<any> => {
  try {
    const response = await API.put(
      `${AdminRoutersEndPoints.adminListOrUnListCategory}/${id}`, // Endpoint with category ID
      {}, // Empty request body
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    console.log("Toggled category listing:", response.data);
    return response.data; // Return updated category status
  } catch (error) {
    throw error;
  }
};



//course

export const getAllCourses = async (search = "", page = 1, limit = 10) => {
  try {
    const response = await API.get(`${AdminRoutersEndPoints.adminGetCourses}`, {
      params: { search, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseDetails = async(courseId:string) => {
  try {
    const response = await API.get(`${AdminRoutersEndPoints.adminGetCourseDetail}/${courseId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const listUnListCourse = async (courseId: string) => {
  try {
    const response = await API.patch(
      `${AdminRoutersEndPoints.adminToggleList}/${courseId}/listing`
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyCourse = async(courseId:string)=>{
  try {
    const response = await API.patch(`${AdminRoutersEndPoints.adminVerifyCourse}/${courseId}/verifyCourse`)
    return response.data
  } catch (error) {
    throw error
  }
}
