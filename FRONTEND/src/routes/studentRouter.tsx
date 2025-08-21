import { Routes, Route } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import UserSessionRoute from '../protector/UserSessionRoute'
import LandingPage from "../pages/LandingPage";
import EnrollPage from "../pages/EnrollPage";
import SignUp from "../pages/student/Auth/SignUp";
import LoginPage from "../pages/student/Auth/Login";
import OTPVerification from "../pages/student/Auth/OTPVerification";
import ForgotPassword from "../pages/student/Auth/ForgotPassword";
import ResetVerificationOTP from "../pages/student/Auth/ResetVerificationOtp";
import ResetPassword from "../pages/student/Auth/ResetPassword";
import StudentSidebarLayout from "../layouts/StudentSidebarLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import PrivateRoute from '../protector/UserPrivateRoute'
import StudentProfilePage from "../pages/student/profile/StudentProfilePage";
import StudentProfileEditPage from "../pages/student/profile/StudentEditProfile";




const StudentRouter = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/enrollPage" element={<EnrollPage />} />
        <Route
          path="/user/signUp"
          element={
            <UserSessionRoute>
              <SignUp />
            </UserSessionRoute>
          }
        />
        <Route
          path="/user/login"
          element={
            <UserSessionRoute>
              <LoginPage />
            </UserSessionRoute>
          }
        />
        <Route
          path="/user/verifyOtp"
          element={
            <UserSessionRoute>
              <OTPVerification />
            </UserSessionRoute>
          }
        />

        {/* reset password in case of forgot password */}
        <Route path="/user/verifyEmail" element={<ForgotPassword />} />
        <Route
          path="/user/forgotPasswordOtp"
          element={<ResetVerificationOTP />}
        />
        <Route path="/user/resetPassword" element={<ResetPassword />} />
      </Route>

      {/* profile management */}
      <Route element={<PrivateRoute />}>
        <Route path="/user" element={<StudentSidebarLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="editProfile" element={<StudentProfileEditPage />} />
          
        </Route>

      </Route>
    </Routes>
  );
};

export default StudentRouter;
