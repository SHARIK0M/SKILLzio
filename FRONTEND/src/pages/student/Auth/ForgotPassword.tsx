import { Formik, Form } from "formik";
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, Link } from "react-router-dom";

import InputField from "../../../components/common/InputField";
import { verifyEmail } from "../../../api/auth/UserAuthentication";

const ForgotPassword = () => {
  const initialValues = {
    email: ""
  };

  const navigate = useNavigate();

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await verifyEmail(data.email);
      if (response?.success) {
        localStorage.setItem("ForgotPassEmail", response.data.email);
        toast.success(response.message);
        navigate(`/user/forgotPasswordOtp`);
      } else {
        toast.error(response?.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during password reset request", error);
      toast.error("Something went wrong");
    }
  };

  const emailSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required")
  });

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f7f7] via-white to-[#e6f7f7] p-6">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 border border-gray-200">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="text-4xl font-extrabold tracking-widest text-[#49BBBD]">
          SKILL<span className="text-gray-800">zio</span>
        </div>
        <h2 className="text-2xl font-semibold mt-3 text-gray-800">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email to reset your password
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={emailSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form className="space-y-6">
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
            />

            <button
              type="submit"
              className="w-full bg-[#49BBBD] hover:bg-[#3ea7a9] transition duration-300 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg"
            >
              Continue
            </button>
          </Form>
        )}
      </Formik>

      <div className="text-center mt-8">
        <Link
          to="/user/login"
          className="text-sm text-[#49BBBD] hover:text-[#379c9d] hover:underline transition-colors duration-200"
        >
          &larr; Back to Login
        </Link>
      </div>
    </div>
  </div>
);


};

export default ForgotPassword;
