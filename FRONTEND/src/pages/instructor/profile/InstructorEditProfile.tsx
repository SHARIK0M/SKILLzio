import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  instructorGetProfile,
  instructorUpdateProfile,
  instructorUpdatePassword,
} from "../../../api/action/InstructorActionApi";
import { useDispatch } from "react-redux";
import { setInstructor } from "../../../redux/slices/instructorSlice";

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9_ ]{3,30}$/,
      "Name must be 3–30 characters and can contain letters, numbers, spaces, or underscores"
    )
    .required("Name is required"),

  skills: Yup.string().test(
    "valid-skills",
    "Please enter at least one skill",
    (value) => {
      if (!value) return false;
      const skills = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return skills.length > 0;
    }
  ),

  expertise: Yup.string().test(
    "valid-expertise",
    "Please enter at least one expertise",
    (value) => {
      if (!value) return false;
      const exp = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return exp.length > 0;
    }
  ),
});

const PasswordSchema = Yup.object().shape({
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

const InstructorProfileEditPage = () => {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await instructorGetProfile();
        if (response.success) {
          const profile = response.data;
          setInitialValues({
            name: profile.username || "",
            email: profile.email || "",
            skills: profile.skills?.join(", ") || "",
            expertise: profile.expertise?.join(", ") || "",
            profilePic: null,
          });
          if (profile.profilePicUrl) {
            setPreviewImage(profile.profilePicUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append("username", values.name.trim());
    formData.append(
      "skills",
      JSON.stringify(values.skills.split(",").map((s: string) => s.trim()))
    );
    formData.append(
      "expertise",
      JSON.stringify(values.expertise.split(",").map((e: string) => e.trim()))
    );
    if (values.profilePic) {
      formData.append("profilePic", values.profilePic);
    }

    try {
      const response = await instructorUpdateProfile(formData);
      if (response.success) {
        dispatch(
          setInstructor({
            userId: response.data._id,
            name: response.data.username,
            email: response.data.email,
            role: response.data.role,
            isBlocked: response.data.isBlocked,
            isVerified: response.data.isVerified,
            profilePicture: response.data.profilePicUrl,
          })
        );
        toast.success("Profile updated successfully");
        setTimeout(() => {
          navigate("/instructor/profile");
        }, 1500);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Update error", err);
      toast.error("Something went wrong");
    }
  };

  const handlePasswordSubmit = async (values: any, { resetForm }: any) => {
    try {
      const res = await instructorUpdatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully");
        resetForm();
        setShowPasswordForm(false);
      } else {
        toast.error(res.message || "Password update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 text-sm font-semibold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!initialValues) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
          Edit Profile
        </h1>
        <p className="text-gray-400">
          Update your professional information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Form */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Profile Information
            </h2>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleProfileSubmit}
            enableReinitialize
          >
            {({ setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <Field
                    name="name"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-600/30 border border-gray-600/30 rounded-xl text-gray-400 cursor-not-allowed">
                    {values.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Skills Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills (comma separated)
                  </label>
                  <Field
                    name="skills"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g. JavaScript, React, Node.js"
                  />
                </div>

                {/* Expertise Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expertise (comma separated)
                  </label>
                  <Field
                    name="expertise"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g. Full Stack Development, MERN Stack"
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {previewImage && (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-0.5">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:cursor-pointer hover:file:bg-orange-600"
                      onChange={(event: any) => {
                        const fileInput = event.currentTarget;
                        const file = fileInput.files[0];
                        const allowedTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/jpg",
                          "image/webp",
                        ];

                        if (file) {
                          if (!allowedTypes.includes(file.type)) {
                            toast.error(
                              "Only image files (JPG, JPEG, PNG, WebP) are allowed"
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
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                    onClick={() => navigate("/instructor/profile")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Password Change Section */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Security Settings
              </h2>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                showPasswordForm
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {!showPasswordForm ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-3xl flex items-center justify-center">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Password Security
              </h3>
              <p className="text-gray-400 mb-6">
                Keep your account secure by updating your password regularly
              </p>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Update Password
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <Field
                    name="currentPassword"
                    type="password"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <Field
                    name="newPassword"
                    type="password"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <Field
                    name="confirmPassword"
                    type="password"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Update Password
                </button>
              </Form>
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfileEditPage;
