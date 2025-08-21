import { Routes, Route } from "react-router-dom";

import SignUp from "../pages/instructor/Auth/SignUp";
import InstructorHeader from "../components/instructorComponent/InstructorHeader"; 
import OTPVerification from "../pages/instructor/Auth/OTPVerification";
import LoginPage from "../pages/instructor/Auth/Login";
import ForgotPassword from "../pages/instructor/Auth/ForgotPassword";
import ResetVerificationOTP from "../pages/instructor/Auth/ResetVerificationOtp";
import ResetPassword from "../pages/instructor/Auth/ResetPassword";
import InstructorSessionRoute from "../protector/InstructorSessionRoute"

import VerificationForm from "../pages/instructor/Verification/InstructorVerificationForm";
import InstructorVerificationStatus from "../pages/instructor/Verification/InstructorVerificationStatus";
import InstructorSidebarLayout from "../layouts/InstructorSidebarLayout";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import PrivateRoute from "../protector/InstructorPrivateRoute";


import InstructorProfilePage from "../pages/instructor/profile/InstructorProfilePage";
import InstructorProfileEditPage from "../pages/instructor/profile/InstructorEditProfile";


const InstructorRouter = () => {
  return (
    <Routes>
      <Route element={<InstructorHeader />}>
        <Route path="signUp" element={<SignUp />} />
        <Route path="verifyOtp" element={<OTPVerification />} />

        <Route element={<InstructorSessionRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route path="verifyEmail" element={<ForgotPassword />} />
        <Route path="forgotPasswordOtp" element={<ResetVerificationOTP />} />
        <Route path="resetPassword" element={<ResetPassword />} />

        <Route path="verification" element={<VerificationForm />} />
        <Route
          path="verificationStatus/:email"
          element={<InstructorVerificationStatus />}
        />
        <Route path="reverify" element={<VerificationForm />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<InstructorSidebarLayout />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="profile" element={<InstructorProfilePage />} />
          <Route path="editProfile" element={<InstructorProfileEditPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default InstructorRouter;
