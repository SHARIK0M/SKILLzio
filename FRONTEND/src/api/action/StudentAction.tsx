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

export const allCourses = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userCourseList);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const courseDetail = async (courseId: string) => {
  try {
    const response = await API.get(
      `${UserRouterEndpoints.userCourseDetail}/${courseId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// StudentAction.ts
export const CoursesFiltered = async (
  page = 1,
  limit = 8,
  search = "",
  sort = "name-asc",
  categoryId?: string
) => {
  try {
    const response = await API.get(UserRouterEndpoints.userCourseFilter, {
      params: {
        page,
        limit,
        search,
        sort,
        category: categoryId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userGetAllCategories);
    return response.data.data; // Adjust depending on your response shape
  } catch (error) {
    throw error;
  }
};

//cart actions

export const getCart = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userGetCart);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (courseId: string) => {
  try {
    const response = await API.post(UserRouterEndpoints.userAddToCart, {
      courseId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (courseId: string) => {
  try {
    const response = await API.delete(
      `${UserRouterEndpoints.userRemoveCourseFromCart}/${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await API.delete(UserRouterEndpoints.userClearCart);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//wishlist actions

export const getWishlist = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userGetWishlist);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToWishlist = async (courseId: string) => {
  try {
    const response = await API.post(
      UserRouterEndpoints.userAddTowishlist,
      {
        courseId,
      },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlist = async (courseId: string) => {
  try {
    const response = await API.delete(
      `${UserRouterEndpoints.userRemoveWishlist}/${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const courseAlreadyExistInWishlist = async (courseId: string) => {
  try {
    const response = await API.get(
      `${UserRouterEndpoints.userCheckCourseExistInWishlist}/${courseId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//checkout actions

export const initiateCheckout = async (
  courseIds: string[],
  totalAmount: number,
  paymentMethod: "razorpay" | "wallet"
) => {
  try {
    const response = await API.post(UserRouterEndpoints.userInitiateCheckout, {
      courseIds,
      totalAmount,
      paymentMethod,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkoutCompleted = async ({
  orderId,
  paymentId,
  method,
  amount,
}: {
  orderId: string;
  paymentId: string;
  method: string;
  amount: number;
}) => {
  try {
    const response = await API.post(UserRouterEndpoints.userCompleteCheckout, {
      orderId,
      paymentId,
      method,
      amount,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};











// wallet page

export const getWallet = async () => {
  try {
    const response = await API.get(UserRouterEndpoints.userGetWallet);
    return response.data;
  } catch (error) {
    throw error;
  }
};
