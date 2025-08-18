import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

import PasswordField from "../../../components/common/PasswordField";
import { resetPassword } from "../../../api/auth/UserAuthentication";

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
      const response = await resetPassword(data.newPassword);
      if (response.success) {
        toast.success(response.message);
        localStorage.removeItem("ForgotPassEmail");
        navigate(`/user/login`);
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-tr from-teal-50 via-white to-teal-100 flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 sm:p-12 border border-gray-200">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
          <span className="text-[#49BBBD]">Skill</span>zio
        </h1>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
        Reset Your Password
      </h2>
      <p className="text-gray-500 text-center text-sm mb-8 max-w-xs mx-auto">
        Enter a new password to securely regain access to your account.
      </p>

      <Formik
        initialValues={initialValues}
        validationSchema={resetPasswordSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form className="space-y-6">
            <PasswordField name="newPassword" placeholder="New Password" />
            <PasswordField
              name="confirmPassword"
              placeholder="Confirm Password"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#49BBBD] text-white rounded-2xl font-semibold hover:bg-teal-600 transition duration-300 shadow-lg"
            >
              Confirm Reset
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-8 text-center">
        <a
          href="/instructor/login"
          className="text-[#49BBBD] hover:text-teal-700 hover:underline text-sm font-medium transition"
        >
          Back to Login
        </a>
      </div>
    </div>
  </div>
);


};

export default ResetPassword;
