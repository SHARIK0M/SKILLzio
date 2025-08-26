import { useEffect, useState } from "react";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  instructorCreateCourse,
  getInstructorCategories,
} from "../../../api/action/InstructorActionApi";
import InputField from "../../../components/common/InputField";

interface Category {
  _id: string;
  categoryName: string;
}

const MAX_VIDEO_SIZE_MB = 200;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const CourseCreatePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getInstructorCategories();
        setCategories(res);
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const validationSchema = Yup.object({
    courseName: Yup.string()
      .trim()
      .matches(
        /^[A-Za-z ]{6,}$/,
        "Minimum 6 letters. Only letters and spaces allowed"
      )
      .test("not-only-spaces", "Course name cannot be just spaces", (value) =>
        Boolean(value && value.trim().replace(/\s/g, "").length >= 6)
      )
      .required("Course name is required"),

    description: Yup.string()
      .trim()
      .test(
        "not-only-spaces",
        "Description must contain meaningful text",
        (value) =>
          Boolean(value && value.trim().replace(/\s/g, "").length >= 10)
      )
      .required("Description is required"),

    category: Yup.string().required("Category is required"),

    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be greater than zero")
      .required("Price is required"),

    duration: Yup.string()
      .matches(/^[1-9][0-9]*$/, "Duration must be a positive number")
      .required("Duration is required"),

    level: Yup.string()
      .oneOf(
        ["Beginner", "Intermediate", "Advanced"],
        "Invalid level selection"
      )
      .required("Level is required"),
  });

  const formik = useFormik({
    initialValues: {
      courseName: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      level: "",
      thumbnail: null,
      demoVideo: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!values.thumbnail || !values.demoVideo) {
        toast.error("Thumbnail and demo video are required");
        return;
      }

      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseName", values.courseName);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("price", values.price.toString());
      formData.append("duration", values.duration);
      formData.append("level", values.level);
      formData.append("thumbnail", values.thumbnail);
      formData.append("demoVideos", values.demoVideo);

      try {
        const res = await instructorCreateCourse(formData);
        toast.success(res.data.message);
        navigate("/instructor/courses");
      } catch (err: any) {
        toast.error(err?.response?.data?.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    setThumbnailError("");
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setThumbnailError("Only JPG, PNG, or WebP image formats are allowed");
        e.currentTarget.value = "";
        return;
      }
      formik.setFieldValue("thumbnail", file);

      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    setVideoError("");
    if (file) {
      if (!file.type.startsWith("video/")) {
        setVideoError("Only valid video files are allowed");
        e.currentTarget.value = "";
        return;
      }

      const maxSize = MAX_VIDEO_SIZE_MB * 1024 * 1024;
      if (file.size > maxSize) {
        setVideoError(`Video size must be under ${MAX_VIDEO_SIZE_MB}MB`);
        e.currentTarget.value = "";
        return;
      }

      formik.setFieldValue("demoVideo", file);

      const reader = new FileReader();
      reader.onload = () => setVideoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Create New Course
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Build an engaging learning experience for your students
            </p>
          </div>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Course Information Section */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-xl">📖</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Course Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Name
                  </label>
                  <input
                    name="courseName"
                    type="text"
                    value={formik.values.courseName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your course name..."
                  />
                  {formik.touched.courseName && formik.errors.courseName && (
                    <p className="text-red-400 text-sm mt-2 font-medium">
                      {formik.errors.courseName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" className="text-gray-400">
                      Select Category
                    </option>
                    {categories.map((cat) => (
                      <option
                        key={cat._id}
                        value={cat._id}
                        className="text-white bg-gray-800"
                      >
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <p className="text-red-400 text-sm mt-2 font-medium">
                      {formik.errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formik.values.level}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" className="text-gray-400">
                      Select Level
                    </option>
                    <option value="Beginner" className="text-white bg-gray-800">
                      Beginner
                    </option>
                    <option
                      value="Intermediate"
                      className="text-white bg-gray-800"
                    >
                      Intermediate
                    </option>
                    <option value="Advanced" className="text-white bg-gray-800">
                      Advanced
                    </option>
                  </select>
                  {formik.touched.level && formik.errors.level && (
                    <p className="text-red-400 text-sm mt-2 font-medium">
                      {formik.errors.level}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-red-400 text-sm mt-2 font-medium">
                      {formik.errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    name="duration"
                    type="text"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter duration..."
                  />
                  {formik.touched.duration && formik.errors.duration && (
                    <p className="text-red-400 text-sm mt-2 font-medium">
                      {formik.errors.duration}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Provide a detailed description of your course..."
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-400 text-sm mt-2 font-medium">
                  {formik.errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-xl">🎬</span>
              </div>
              <h3 className="text-xl font-bold text-white">Course Media</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Course Thumbnail
                </label>
                <div className="space-y-4">
                  {thumbnailPreview && (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-full h-48 object-cover rounded-2xl border-2 border-orange-500/30"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg">
                        ✓ Uploaded
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-600 rounded-2xl p-6 text-center hover:border-orange-500/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-orange-400">🖼️</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                      JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                  {thumbnailError && (
                    <p className="text-red-400 text-sm font-medium">
                      {thumbnailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Demo Video
                </label>
                <div className="space-y-4">
                  {videoPreview && (
                    <div className="relative">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-48 rounded-2xl border-2 border-orange-500/30 bg-black"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg">
                        ✓ Uploaded
                      </div>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-600 rounded-2xl p-6 text-center hover:border-orange-500/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-orange-400">🎥</span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                      MP4, WebM up to {MAX_VIDEO_SIZE_MB}MB
                    </p>
                  </div>
                  {videoError && (
                    <p className="text-red-400 text-sm font-medium">
                      {videoError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center mb-3">
              <span className="text-orange-400 text-lg mr-2">💡</span>
              <h4 className="text-orange-300 font-semibold">
                Course Creation Tips
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
              <ul className="space-y-1">
                <li>• Choose a clear, descriptive course name</li>
                <li>• Write a compelling course description</li>
                <li>• Select the appropriate difficulty level</li>
              </ul>
              <ul className="space-y-1">
                <li>• Use high-quality thumbnail images</li>
                <li>• Keep demo videos under {MAX_VIDEO_SIZE_MB}MB</li>
                <li>• Set competitive pricing for your market</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className={`group flex items-center space-x-3 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg ${
                submitting
                  ? "bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transform hover:scale-105 shadow-orange-500/25"
              } text-white`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    🚀
                  </span>
                  <span className="tracking-wide">CREATE COURSE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default CourseCreatePage;
