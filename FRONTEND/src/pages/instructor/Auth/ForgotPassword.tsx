import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

import InputField from "../../../components/common/InputField";
import { instructorVerifyEmail } from "../../../api/auth/InstructorAuthentication";

const ForgotPassword = () => {
  const initialValues = { email: "" };
  const navigate = useNavigate();

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await instructorVerifyEmail(data.email);
      if (response?.success) {
        localStorage.setItem("ForgotPassEmail", response.data.email);
        toast.success(response.message);
        navigate(`/instructor/forgotPasswordOtp`);
      } else {
        toast.error(
          response?.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during password reset request", error);
      toast.error("Something went wrong");
    }
  };

  const emailSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-10 border border-purple-200">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-purple-700">
            <span className="text-pink-500">Skill</span>zio
          </h1>
          <h2 className="mt-3 text-xl font-semibold text-gray-700">
            Forgot Your Password?
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            Enter your email to receive a reset link.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={emailSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <InputField
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
              
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-transform transform ${
                  isSubmitting
                    ? "bg-purple-300 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600 hover:scale-105"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-8 text-center">
          <Link
            to="/instructor/login"
            className="text-sm text-purple-600 hover:text-pink-600 transition-colors underline"
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
