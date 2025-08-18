import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

import PasswordField from "../../../components/common/PasswordField";
import { instructorResetPassword } from '../../../api/auth/InstructorAuthentication';

const ResetPassword = () => {
  const navigate = useNavigate();

  const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

  const initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const onSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    try {
      const response = await instructorResetPassword(data.newPassword);
      if (response.success) {
        toast.success(response.message);
        localStorage.removeItem("ForgotPassEmail");
        navigate(`/instructor/login`);
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
  
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-10 sm:p-12 border border-purple-300">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-purple-900 tracking-tight">
            <span className="text-pink-500">Skill</span>zio
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-purple-900 text-center mb-2">
          Reset Your Password
        </h2>
        <p className="text-purple-700 text-sm text-center mb-8">
          Enter a new password to regain access to your account.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={resetPasswordSchema}
          onSubmit={onSubmit}
        >
          {() => (
            <Form className="space-y-6">
              <PasswordField
                name="newPassword"
                placeholder="New Password"
               
              />
              <PasswordField
                name="confirmPassword"
                placeholder="Confirm Password"
               
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:brightness-110 transition"
              >
                Confirm Reset
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-8 text-center">
          <a
            href="/user/login"
            className="text-purple-800 hover:underline text-sm font-medium"
          >
            &larr; Back to Login
          </a>
        </div>
      </div>
    </div>
  );

};

export default ResetPassword;
