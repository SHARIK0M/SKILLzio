import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";

import PasswordField from "../../../components/common/PasswordField";
import { setUser } from "../../../redux/slices/userSlice";
import { login, googleLogin } from "../../../api/auth/UserAuthentication";
import { getProfile } from "../../../api/action/StudentAction"; // ✅ Add this import
import type { Login } from "../../../types/LoginTypes";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// ✅ Improved validation
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

  // ✅ Updated login function with profile fetch
  const onSubmit = async (data: Login) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const user = response.user;

      // Debug logs
      console.log("Login API Response - Full user object:", user);
      console.log("Profile picture properties:", {
        profilePicture: user.profilePicture,
        profilePicUrl: user.profilePicUrl,
        profileImage: user.profileImage,
        avatar: user.avatar,
        picture: user.picture,
      });

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(response?.message);

        // ✅ First dispatch basic user data
        dispatch(
          setUser({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            profilePicUrl: user.profilePicUrl || user.profilePicture || null,
          })
        );

        // ✅ Then fetch complete profile data to get the latest profile picture
        try {
          const profileResponse = await getProfile();
          if (profileResponse.success) {
            const completeProfile = profileResponse.data;

            console.log("Profile API Response:", completeProfile);

            const updatedUserData = {
              _id: user._id,
              name: completeProfile.name || user.name || user.username,
              username: completeProfile.username || user.username,
              email: completeProfile.email || user.email,
              role: user.role,
              isBlocked: user.isBlocked,
              profilePicUrl: completeProfile.profilePicUrl,
            };

            dispatch(setUser(updatedUserData));

            // Update localStorage with complete data
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...user,
                name: completeProfile.name,
                username: completeProfile.username,
                profilePicUrl: completeProfile.profilePicUrl,
              })
            );

            console.log("Final user data set in Redux:", updatedUserData);
          }
        } catch (profileError) {
          console.warn("Could not fetch complete profile:", profileError);
        }

        navigate("/");
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again";
      toast.error(errorMessage);
    }
  };

  // ✅ Updated Google login function
  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Invalid Google Credential");
        return;
      }

      const decoded: any = jwtDecode(credentialResponse.credential);

      const response = await googleLogin({
        name: decoded.name,
        email: decoded.email,
        password: decoded.sub,
        profilePicture: decoded.picture,
        role: "student",
      });

      const user = response?.user;

      // Debug logs for Google login
      console.log("Google Login API Response - Full user object:", user);

      if (user) {
        // ✅ First dispatch basic user data
        const profilePicUrl =
          user.profilePicUrl ||
          user.profilePicture ||
          user.profileImage ||
          decoded.picture ||
          null;

        dispatch(
          setUser({
            _id: user._id,
            username: user.username || user.name,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            profilePicUrl: profilePicUrl,
          })
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            profilePicUrl: profilePicUrl,
          })
        );

        // ✅ Then fetch complete profile data for Google users too
        try {
          const profileResponse = await getProfile();
          if (profileResponse.success) {
            const completeProfile = profileResponse.data;

            const updatedUserData = {
              _id: user._id,
              name: completeProfile.name || user.name,
              username: completeProfile.username || user.username || user.name,
              email: completeProfile.email || user.email,
              role: user.role,
              isBlocked: user.isBlocked,
              profilePicUrl: completeProfile.profilePicUrl || profilePicUrl,
            };

            dispatch(setUser(updatedUserData));

            localStorage.setItem(
              "user",
              JSON.stringify({
                ...user,
                name: completeProfile.name,
                username: completeProfile.username,
                profilePicUrl: completeProfile.profilePicUrl || profilePicUrl,
              })
            );
          }
        } catch (profileError) {
          console.warn(
            "Could not fetch complete profile for Google user:",
            profileError
          );
        }

        toast.success(response.message || "Signed up with Google!");
        navigate("/");
      } else {
        toast.error(response.message || "Google sign-up failed");
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Google login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 p-6">
      <div className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-md border border-teal-200">
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-[#49BBBD] mb-10 tracking-wide">
          Welcome Back
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          {() => (
            <Form className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full mt-2 p-3 border border-teal-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#49BBBD] text-gray-900"
                />
              </div>

              {/* Password */}
              <div>
                <PasswordField name="password" placeholder="Enter password" />
              </div>

              {/* Forgot password */}
              <div className="flex justify-between items-center">
                <Link
                  to="/user/verifyEmail"
                  className="text-sm text-[#49BBBD] hover:text-teal-700 hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-coral-500 to-teal-500 hover:from-coral-600 hover:to-teal-600 text-white py-3 rounded-xl font-semibold shadow-md transition duration-300"
              >
                Login
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <hr className="flex-grow border-slate-300" />
                <span className="text-slate-400 text-sm">Or</span>
                <hr className="flex-grow border-slate-300" />
              </div>

              {/* Google Login */}
              <div>
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                >
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => toast.error("Google Login Failed")}
                      text="continue_with"
                    />
                  </div>
                </GoogleOAuthProvider>
              </div>

              {/* Signup Link */}
              <p className="text-center text-sm text-slate-500 mt-6">
                New to{" "}
                <span className="text-[#49BBBD] font-semibold">SKILLzio</span>?{" "}
                <Link
                  to="/user/signup"
                  className="text-[#49BBBD] hover:text-teal-700 hover:underline transition"
                >
                  Create an account
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;
