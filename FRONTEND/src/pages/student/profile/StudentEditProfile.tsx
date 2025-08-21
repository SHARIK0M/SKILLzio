// StudentProfileEditPage.tsx
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import {
  getProfile,
  updateProfile,
  updatePassword,
} from "../../../api/action/StudentAction";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/userSlice";

const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .matches(
      /^[a-zA-Z0-9_]{3,30}$/,
      "Username must be 3-30 characters, only letters, numbers, underscores"
    )
    .required("Username is required"),
});

const PasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your new password"),
});

const StudentProfileEditPage = () => {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          const profile = response.data;
          setInitialValues({
            username: profile.username || "",
            name: profile.name || "",
            email: profile.email || "",
            profilePic: null,
          });
          if (profile.profilePicUrl) {
            setPreviewImage(profile.profilePicUrl);
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append("username", values.username);
    if (values.profilePic) {
      formData.append("profilePic", values.profilePic);
    }

    try {
      const response = await updateProfile(formData);
      if (response.success) {
        dispatch(setUser(response.data));
        toast.success("Profile updated successfully");
        setTimeout(() => {
          navigate("/user/profile");
        }, 1500);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile", err);
      toast.error("Something went wrong");
    }
  };

  const handlePasswordSubmit = async (values: any, { resetForm }: any) => {
    try {
      const res = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      console.log(res);
      if (res.success) {
        toast.success("Password updated successfully");
        resetForm();
        setShowPasswordForm(false);
      } else {
        toast.error(res.message || "Password update failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Password update failed";
      toast.error(errorMessage);
    }
  };

  const getUserInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "ST"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
          <div className="mt-4 text-gray-600 font-medium">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!initialValues) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 p-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Edit Your Profile
              </h1>
              <p className="text-emerald-100">
                Update your information and settings
              </p>
            </div>
            <button
              onClick={() => navigate("/user/profile")}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "profile"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profile Information</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "security"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Security Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Information Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleProfileSubmit}
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5 mx-auto">
                        <div className="w-full h-full rounded-3xl overflow-hidden">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                              <span className="text-white font-bold text-3xl">
                                {getUserInitials(values.username || "Student")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center"
                        onClick={() =>
                          document.getElementById("profile-pic-input")?.click()
                        }
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    <input
                      id="profile-pic-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event: any) => {
                        const fileInput = event.currentTarget;
                        const file = fileInput.files[0];

                        if (file) {
                          const validImageTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/gif",
                            "image/webp",
                          ];
                          if (!validImageTypes.includes(file.type)) {
                            toast.error(
                              "Only image files (JPG, PNG, GIF, WebP) are allowed"
                            );
                            fileInput.value = "";
                            return;
                          }

                          setFieldValue("profilePic", file);

                          const reader = new FileReader();
                          reader.onload = () =>
                            setPreviewImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <p className="text-sm text-gray-600">
                      Click the camera icon to change your profile picture
                    </p>
                  </div>

                  <div className="flex-1 space-y-6 w-full">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Personal Information
                    </h3>

                    {/* Read-only fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Full Name
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-gray-800 font-medium">
                            {values.name || "Not provided"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            This field cannot be changed
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Email Address
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-gray-800 font-medium">
                            {values.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            This field cannot be changed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Editable field */}
                    <div>
                      <InputField
                        name="username"
                        label="Username"
                        type="text"
                        placeholder="Enter username"
                        
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                    onClick={() => navigate("/user/profile")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password Change Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Change Password
                </h3>
                <p className="text-gray-600 mt-1">
                  Update your account password for better security
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {!showPasswordForm ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  Keep your account secure by updating your password regularly
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <Formik
                initialValues={{
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordSubmit}
              >
                <Form className="space-y-6">
                  <div className="grid gap-6">
                    <InputField
                      name="currentPassword"
                      type="password"
                      label="Current Password"
                      placeholder="Enter current password"
                    />
                    <InputField
                      name="newPassword"
                      type="password"
                      label="New Password"
                      placeholder="Enter new password"
                    />
                    <InputField
                      name="confirmPassword"
                      type="password"
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains at least one number</li>
                      <li>• Contains at least one special character</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Update Password
                    </button>
                  </div>
                </Form>
              </Formik>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Security Tips</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Strong Password
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Use a unique password with mixed characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">
                      Regular Updates
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Change your password every 3-6 months
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">
                      Secure Login
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Always log out from shared devices
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800">
                      Stay Alert
                    </h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Watch for suspicious account activity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileEditPage;
