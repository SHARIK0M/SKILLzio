import { API } from "../../service/axios";

import authenticationRoutes from "../../types/EndPoints/auth.Endpoints";

import type { userData } from "../../types/userData";

import type { Login } from "../../types/LoginTypes";

// Student signup: send user data to student signup endpoint
export const signup = async (userData: userData): Promise<any> => {
  try {
    console.log("userData", userData);
    // POST request to create new student account
    const response = await API.post(
      authenticationRoutes.studentSignUp,
      userData
    );
    console.log(response);
    return response.data; // Return signup response data
  } catch (error: any) {
    // Special handling for 404 error - rethrow
    if (error.response.status == 404) {
      throw error;
    }
    console.log(error.message); // Log other errors
  }
};

// Resend OTP for student verification or login
export const resendOtp = async (email: string): Promise<any> => {
  try {
    // POST request to resend OTP with email
    const response = await API.post(authenticationRoutes.studentResendOtp, {
      email,
    });
    console.log("resend otp for student", response.data);
    return response.data; // Return OTP resend confirmation
  } catch (error) {
    throw error;
  }
};

// Verify OTP sent to student for verification/login
export const verifyOtp = async (otp: string): Promise<any> => {
  try {
    // POST request to verify OTP
    const response = await API.post(authenticationRoutes.studentVerifyOtp, {
      otp,
    });
    console.log("otpverification for student", response.data);
    return response.data; // Return verification result
  } catch (error) {
    throw error;
  }
};

// Student login: send email, password and role for authentication
export const login = async ({ email, password, role }: Login): Promise<any> => {
  try {
    // POST request to student login endpoint
    const response = await API.post(authenticationRoutes.studentLogin, {
      email,
      password,
      role,
    });

    console.log("login response data", response.data);
    return response.data; // Return login response with tokens/user data
  } catch (error) {
    throw error;
  }
};

// Student logout: clear session on backend
export const logout = async (): Promise<any> => {
  try {
    // POST request to logout endpoint with credentials
    const response = await API.post(
      authenticationRoutes.studentLogout,
      {},
      { withCredentials: true }
    );
    console.log("student logout", response.data);
    return response.data; // Return logout confirmation
  } catch (error) {
    throw error;
  }
};

// Verify if student email exists or is valid (e.g. for password reset)
export const verifyEmail = async (email: string): Promise<any> => {
  try {
    // POST request to verify email endpoint
    const response = await API.post(authenticationRoutes.studentVerifyEmail, {
      email,
    });
    console.log("student or user verifyEmail", response.data);
    return response.data; // Return email verification status
  } catch (error) {
    throw error;
  }
};

// Verify OTP during password reset flow with email and OTP
export const verifyResetOtp = async (email: string, otp: string) => {
  try {
    // POST request to verify reset OTP endpoint with credentials
    const response = await API.post(
      authenticationRoutes.studentVerifyResetOtp,
      { email, otp },
      { withCredentials: true }
    );
    console.log("student or user verifyResetOtp", response.data);
    return response.data; // Return OTP verification result for reset
  } catch (error) {
    throw error;
  }
};

// Resend OTP during forgot password flow
export const forgotResendOtp = async (email: string): Promise<any> => {
  try {
    // POST request to resend OTP during forgot password
    const response = await API.post(
      authenticationRoutes.studentForgotResendOtp,
      { email }
    );
    console.log("forgor resend otp in student or user", response.data);
    return response.data; // Return OTP resend confirmation
  } catch (error) {
    throw error;
  }
};

// Reset password for student with new password after OTP verification
export const resetPassword = async (password: string): Promise<any> => {
  try {
    // POST request to reset password with credentials
    const response = await API.post(
      authenticationRoutes.studentResetPassword,
      { password },
      { withCredentials: true }
    );

    console.log("student reset password", response.data);
    return response.data; // Return password reset success message
  } catch (error) {
    throw error;
  }
};

// Google login for student using OAuth login data
export const googleLogin = async (loginData: object) => {
  try {
    // POST request to Google OAuth login endpoint
    const response = await API.post(
      authenticationRoutes.studentGoogleLogin,
      loginData,
      { withCredentials: true }
    );

    console.log("student google log in", response.data);
    return response.data; // Return OAuth login response
  } catch (error) {
    throw error;
  }
};
