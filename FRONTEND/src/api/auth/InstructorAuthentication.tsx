import { API } from "../../service/axios";
import type { userData } from "../../types/userData";

import authenticationRoutes from "../../types/EndPoints/auth.Endpoints";
import type { Login } from "../../types/LoginTypes";

// Instructor Signup: sends user data to instructor signup endpoint
export const signup = async (userData: userData): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorSignUp,
      userData,
      { withCredentials: true } // include cookies for auth/session
    );
    console.log("Signup response in instructor", response.data);

    return response.data; // Return signup response data (e.g., success message)
  } catch (error) {
    throw error; // Propagate error
  }
};

// Resend OTP for instructor email verification or login flow
export const resendOtp = async (email: string): Promise<any> => {
  try {
    const response = await API.post(authenticationRoutes.instructorResendOtp, {
      email,
    });

    console.log("instructor resend otp response", response.data);

    return response.data; // Return OTP resend confirmation
  } catch (error) {
    throw error;
  }
};

// Verify OTP sent to instructor for account verification or login
export const verifyOtp = async (otp: string): Promise<any> => {
  try {
    const response = await API.post(authenticationRoutes.instructorVerifyOtp, {
      otp,
    });

    console.log("instructor verify otp", response.data);

    return response.data; // Return verification success or failure
  } catch (error) {
    throw error;
  }
};

// Instructor login: send email, password, and role to login endpoint
export const login = async ({ email, password, role }: Login): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorLogin,
      { email, password, role },
      { withCredentials: true }
    );

    console.log("instructorLogin response", response.data);

    return response.data; // Return login response with tokens/user data
  } catch (error) {
    throw error;
  }
};

// Instructor logout: ends session on backend
export const logout = async (): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorLogout,
      {},
      { withCredentials: true }
    );

    console.log("Instructor logout response", response.data);

    return response.data; // Return logout confirmation
  } catch (error) {
    throw error;
  }
};

// Verify if instructor email exists or is valid (for password reset or signup)
export const instructorVerifyEmail = async (email: string): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorVerifyEmail,
      { email }
    );

    console.log("instructor response verify email", response.data);

    return response.data; // Return email verification status
  } catch (error) {
    throw error;
  }
};

// Verify OTP during password reset flow with email and otp
export const instructorVerifyResetOtp = async (email: string, otp: string) => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorVerifyResetOtp,
      { email, otp },
      { withCredentials: true }
    );

    console.log("instructor verify otp response", response.data);

    return response.data; // Return reset OTP verification result
  } catch (error) {
    throw error;
  }
};

// Resend OTP during forgot password flow for instructor
export const instructorForgotResendOtp = async (email: string) => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorForgotResendOtp,
      { email }
    );
    console.log("instructor resendotp", response.data);
    return response.data; // Return OTP resend confirmation
  } catch (error) {
    throw error;
  }
};

// Reset instructor password with new password after OTP verification
export const instructorResetPassword = async (
  password: string
): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorResetPassword,
      { password },
      { withCredentials: true }
    );

    console.log("reset password instructor", response.data);

    return response.data; // Return password reset success message
  } catch (error) {
    throw error;
  }
};

// Google login for instructor using Google OAuth login data
export const googleLogin = async (login: object): Promise<any> => {
  try {
    const response = await API.post(
      authenticationRoutes.instructorGoogleLogin,
      login,
      { withCredentials: true }
    );
    console.log("google login instructor", response.data);
    return response.data; // Return OAuth login response
  } catch (error) {
    throw error;
  }
};
