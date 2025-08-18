import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";

import PasswordField from "../../../components/common/PasswordField";
import { setInstructor } from "../../../redux/slices/instructorSlice";
import { login } from "../../../api/auth/InstructorAuthentication";
import type { Login } from "../../../types/LoginTypes";
import {
  googleLogin,
} from "../../../api/auth/InstructorAuthentication";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { getVerificationRequestByemail } from "../../../api/action/InstructorActionApi";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number"),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
    role: "",
    isBlocked: false,
  };

  const onSubmit = async (data: Login) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const user = response.user;

      if (user) {
        localStorage.setItem("instructor", JSON.stringify(user));
        toast.success(response?.message);

        dispatch(
          setInstructor({
            userId: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
          })
        );

        if (user.isVerified) {
          navigate("/instructor/dashboard");
        } else {
          const verifyStatus = await getVerificationRequestByemail(user.email);

          if (verifyStatus?.data?.status) {
            navigate(`/instructor/verificationStatus/${user.email}`);
          } else {
            navigate("/instructor/verification");
          }
        }
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

    const handleGoogleLogin = async (credentialResponse: any) => {
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);
  
        const response = await googleLogin({
          name: decoded.name,
          email: decoded.email,
          password: decoded.sub,
          profilePicture: decoded.picture,
          mobileNumber: decoded.phoneNumber,
        });
  
        const instructor = response?.instructor;
  
        if (instructor) {
          dispatch(
            setInstructor({
              userId: instructor._id,
              name: instructor.name,
              email: instructor.email,
              role: instructor.role,
              isBlocked: instructor.isBlocked,
              profilePicture: instructor.profilePicture,
              isVerified:instructor.isVerified
            })
          );
          localStorage.setItem("instructor", JSON.stringify(instructor));
          toast.success(response.message || "Signed up with Google!");
          if(instructor.isVerified){
            navigate('/instructor/dashboard')
          }else{
            navigate("/instructor/verification");
          }
        } else {
          toast.error(response.message || "Google sign-up failed");
        }
      } catch (error: any) {
        toast.error(error.message || "Google login failed");
      }
    };

return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr px-4">
    <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200/60 p-8 sm:p-10 overflow-hidden">
      {/* Decorative Gradient Blobs */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-tr from-rose-400 via-purple-500 to-indigo-500 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-indigo-400 via-purple-500 to-rose-400 rounded-full blur-3xl opacity-25"></div>

      {/* Title */}
      <h2 className="relative text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent mb-8">
        Instructor Login
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-indigo-700 mb-2"
              >
                Email Address
              </label>
              <Field
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-indigo-200 rounded-xl shadow-sm text-indigo-900 placeholder-indigo-400 
                focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <PasswordField name="password" placeholder="Enter your password" />

            {/* Forgot Password */}
            <div className="flex justify-end text-sm">
              <Link
                to="/instructor/verifyEmail"
                className="text-rose-600 hover:text-rose-700 underline transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform 
                ${
                  isSubmitting
                    ? "bg-rose-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-rose-500 to-indigo-500 hover:scale-[1.03] hover:shadow-xl"
                }`}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Google Login */}
            <div className="mt-6">
              <p className="text-center text-sm text-indigo-700 font-medium mb-3">
                Or continue with
              </p>
            
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error("Google Login Failed")}
                    text="continue_with" // This changes the text to "Continue with Google"
                  />
                </div>
              </GoogleOAuthProvider>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);


};

export default LoginPage;
