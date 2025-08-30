import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import PasswordField from "../../../components/common/PasswordField";
import { adminLogin } from "../../../api/auth/AdminAuthentication";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await adminLogin(data);
      if (response.success) {
        localStorage.setItem("admin", JSON.stringify(response.data.email));
        toast.success(response.message);
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-purple-200 via-pink-200 to-yellow-200">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-10">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-purple-700 tracking-wide">
          Admin Login
        </h2>

        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-purple-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-red-600 font-medium"
                />
              </div>

              <div>
                <PasswordField
                  name="password"
                  placeholder="Enter your password"
                 
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-transform transform
                  ${
                    isSubmitting
                      ? "bg-purple-300 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
                  }`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;
