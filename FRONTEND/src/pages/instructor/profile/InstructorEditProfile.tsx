import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  instructorGetProfile,
  instructorUpdateProfile,
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

const InstructorProfileEditPage = () => {
  const [initialValues, setInitialValues] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (values: any) => {
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

  if (!initialValues) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-300 text-lg font-semibold">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

      {/* Main Edit Form Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">✏️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Edit Instructor Profile
              </h2>
              <p className="text-gray-400 text-sm">
                Update your profile information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-2xl border border-gray-600/30">
                        <div className="mb-3">
                          <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider flex items-center">
                            <span className="mr-2">👤</span>
                            Full Name
                          </h3>
                        </div>
                        <InputField
                          name="name"
                          label=""
                          type="text"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Skills Field */}
                      <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-2xl border border-gray-600/30">
                        <div className="mb-3">
                          <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider flex items-center">
                            <span className="mr-2">🛠️</span>
                            Skills
                          </h3>
                          <p className="text-gray-400 text-xs mt-1">
                            Separate multiple skills with commas
                          </p>
                        </div>
                        <InputField
                          name="skills"
                          label=""
                          type="text"
                          placeholder="e.g. JavaScript, React, Node.js"
                        />
                      </div>
                    </div>

                    {/* Expertise Field - Full Width */}
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-2xl border border-gray-600/30">
                      <div className="mb-3">
                        <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider flex items-center">
                          <span className="mr-2">🎯</span>
                          Areas of Expertise
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Separate multiple areas with commas
                        </p>
                      </div>
                      <InputField
                        name="expertise"
                        label=""
                        type="text"
                        placeholder="e.g. Full Stack Development, Mobile Apps, AI/ML"
                      />
                    </div>
                  </div>

                  {/* Profile Picture Section */}
                  <div className="lg:w-80">
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-2xl border border-gray-600/30 text-center">
                      <div className="mb-4">
                        <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider flex items-center justify-center">
                          <span className="mr-2">📸</span>
                          Profile Picture
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          Upload your profile photo
                        </p>
                      </div>

                      {/* Current/Preview Image */}
                      <div className="mb-6 flex justify-center">
                        {previewImage ? (
                          <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-lg">
                              <img
                                src={previewImage}
                                alt="Profile Preview"
                                className="w-full h-full rounded-2xl object-cover"
                              />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center border-2 border-gray-500/50">
                            <span className="text-6xl">👨‍🏫</span>
                          </div>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
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
                                fileInput.value = ""; // ❌ Clear the invalid file
                                return;
                              }

                              setFieldValue("profilePic", file);

                              const reader = new FileReader();
                              reader.onload = () =>
                                setPreviewImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 cursor-pointer">
                          📷 Choose Photo
                        </div>
                      </div>

                      <p className="text-gray-500 text-xs mt-3">
                        Supported: JPG, JPEG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-700/30">
                  <button
                    type="button"
                    className="flex-1 sm:flex-none sm:w-32 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                    onClick={() => navigate("/instructor/profile")}
                  >
                    <span className="mr-2">❌</span>
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-none sm:w-40 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center justify-center"
                  >
                    <span className="mr-2">💾</span>
                    Save Changes
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">
              Profile Tips
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                • Use a clear, professional profile picture to build trust with
                students
              </p>
              <p>
                • List specific skills and technologies you're proficient in
              </p>
              <p>
                • Highlight your areas of expertise to attract the right
                students
              </p>
              <p>
                • Keep your information up-to-date for better course
                recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfileEditPage;
