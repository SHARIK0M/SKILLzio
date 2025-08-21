// Define all authentication-related API endpoints
const authenticationRoutes = {
  // ======================
  // Student Authentication
  // ======================
  studentSignUp: "/api/student/signUp", // Register a new student
  studentResendOtp: "/api/student/resendOtp", // Resend OTP for verification
  studentVerifyOtp: "/api/student/createUser", // Verify OTP and create student account
  studentLogin: "/api/student/login", // Login for student
  studentLogout: "/api/student/logout", // Logout student
  studentVerifyEmail: "/api/student/verifyEmail", // Verify student email during reset or registration
  studentVerifyResetOtp: "/api/student/verifyResetOtp", // Verify OTP for password reset
  studentForgotResendOtp: "/api/student/forgotResendOtp", // Resend OTP in forgot password flow
  studentResetPassword: "/api/student/resetPassword", // Reset student password
  studentGoogleLogin: "/api/student/googleLogin", // Login student with Google OAuth

  // =========================
  // Instructor Authentication
  // =========================
  instructorSignUp: "/api/instructor/signUp", // Register a new instructor
  instructorResendOtp: "/api/instructor/resendOtp", // Resend OTP for verification
  instructorVerifyOtp: "/api/instructor/createUser", // Verify OTP and create instructor account
  instructorLogin: "/api/instructor/login", // Login for instructor
  instructorLogout: "/api/instructor/logout", // Logout instructor
  instructorVerifyEmail: "/api/instructor/verifyEmail", // Verify instructor email during reset or registration
  instructorVerifyResetOtp: "/api/instructor/verifyResetOtp", // Verify OTP for password reset
  instructorForgotResendOtp: "/api/instructor/forgotResendOtp", // Resend OTP in forgot password flow
  instructorResetPassword: "/api/instructor/resetPassword", // Reset instructor password
  instructorGoogleLogin: "/api/instructor/googleLogin", // Login instructor with Google OAuth

  // ================
  // Admin Authentication
  // ================
  adminLogin: "/api/admin/login", // Admin login
  adminLogout: "/api/admin/logout", // Admin logout
};

// Export so it can be reused across the project
export default authenticationRoutes;
