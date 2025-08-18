import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import InputField from "../../../components/common/InputField";
import PasswordField from "../../../components/common/PasswordField";
import { signup, googleLogin } from '../../../api/auth/InstructorAuthentication';

import { setInstructor } from "../../../redux/slices/instructorSlice";
import InstructorSignUp from '../../../assets/imag-2.jpg'

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import type { signUp } from "../../../types/signupTypes";

const signupSchema = Yup.object().shape({
  username: Yup.string()
    .matches(
      /^(?=.*[a-zA-Z])[a-zA-Z0-9 _]{3,20}$/,
      "Username must contain letters and be 3–20 characters long"
    )
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/\d/, "Must include a number")
    .matches(/[@$!%*?&]/, "Must include a special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (values: signUp) => {
    try {
      const response = await signup(values);

      if (response.success) {
        localStorage.setItem("verificationToken", response.token);
        localStorage.setItem("email", values.email);
        toast.success(response.message);
        navigate("/instructor/verifyOtp");
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Unknown error occurred");
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
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    {/* Card Container */}
    <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Left Full Image */}
      <div className="w-full md:w-1/2 hidden md:block">
        <img
          src={InstructorSignUp}
          alt="instructor"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-purple-900 mb-8 text-center">
            Instructor Sign Up
          </h2>

          <Formik<signUp>
            initialValues={{
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={signupSchema}
            onSubmit={handleRegister}
          >
            {() => (
              <Form className="space-y-6">
                <InputField
                  name="username"
                  type="text"
                  label="Username"
                  placeholder="Enter username"
                />
                <InputField
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="Enter email"
                />
                <PasswordField
                  name="password"
                  placeholder="Enter password"
                  label="password"
                />
                <PasswordField
                  name="confirmPassword"
                  placeholder="Confirm password"
                  label="Confirm password"
                />

                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Register
                </button>
              </Form>
            )}
          </Formik>

          {/* Divider and Google Login */}
          <div className="mt-8">
            <p className="text-center text-sm text-purple-800 mb-3 font-medium">
              Or sign up with Google
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
        </div>
      </div>
    </div>
  </div>
);


};

export default SignUp;
