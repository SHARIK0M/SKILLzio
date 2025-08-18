import InstructorRouterEndPoints from "../../types/EndPoints/instructor.Endpoints";
import { API } from "../../service/axios";

// Send a verification request with form data (e.g., documents, info)
export const sendVerification = async (formData: FormData) => {
  try {
    // POST request to send verification request with multipart/form-data
    const response = await API.post(
      InstructorRouterEndPoints.instructorSendVerificationRequest,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
        withCredentials: true, // Include cookies for auth
      }
    );
    console.log("sendVerification request", response.data);
    return response.data; // Return server response (e.g., success message)
  } catch (error) {
    console.log(error); // Log error if request fails
  }
};

// Get verification request details/status by instructor email
export const getVerificationRequestByemail = async (email: string) => {
  try {
    // GET request to fetch verification status/details by email
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorGetVerificationStatus}/${email}`,
      {
        withCredentials: true, // Include cookies for auth
      }
    );

    console.log("instructorVerification detail", response.data);
    return response.data; // Return verification details from server
  } catch (error) {
    throw error; // Propagate error for handling outside
  }
};