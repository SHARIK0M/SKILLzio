import { API } from "../../service/axios";
import UserRouterEndpoints from "../../types/EndPoints/user.Endpoints"


export const getProfile = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userProfilePage, {
      withCredentials: true,
    });

    console.log("profile data response", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (formData: FormData): Promise<any> => {
  try {
    const response = await API.put(
      UserRouterEndpoints.userProfilePage,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    console.log("updateprofile response", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (data: any): Promise<any> => {
  try {
    const response = await API.put(
      UserRouterEndpoints.userUpdatePassWord,
      data,
      {
        withCredentials: true,
      }
    );

    console.log("password updation data", response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};
