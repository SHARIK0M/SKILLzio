import { useEffect, useState, useRef } from "react";
import { useFormik, FormikProvider } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { toast } from "react-toastify";

import InputField from "../../../components/common/InputField";
import {
  instructorGetCourseById,
  instructorUpdateCourse,
  getInstructorCategories,
} from "../../../api/action/InstructorActionApi";

const MAX_VIDEO_SIZE_MB = 200;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const CourseEditPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    { _id: string; categoryName: string }[]
  >([]);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);
  const [existingDemoVideoUrl, setExistingDemoVideoUrl] = useState<
    string | null
  >(null);
  const [thumbnailError, setThumbnailError] = useState("");
  const [videoError, setVideoError] = useState("");

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    validationSchema: Yup.object({
      courseName: Yup.string()
        .trim()
        .matches(
          /^[A-Za-z ]{6,}$/,
          "Minimum 6 letters. Only letters and spaces allowed"
        )
        .required("Course name is required"),
      description: Yup.string()
        .trim()
        .min(10, "Must be at least 10 characters")
        .required("Description is required"),
      category: Yup.string().required("Category is required"),
      price: Yup.number()
        .typeError("Must be a number")
        .positive("Price must be greater than 0")
        .required("Price is required"),
      duration: Yup.string()
        .matches(/^[1-9][0-9]*$/, "Duration must be a positive number")
        .required("Duration is required"),
      level: Yup.string()
        .oneOf(["beginner", "intermediate", "advanced"], "Invalid level")
        .required("Level is required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("courseName", values.courseName.trim());
      formData.append("description", values.description.trim());
      formData.append("category", values.category);
      formData.append("price", values.price.toString());
      formData.append("duration", values.duration);
      formData.append("level", values.level);

      if (values.thumbnail) formData.append("thumbnail", values.thumbnail);
      if (values.demoVideo) formData.append("demoVideos", values.demoVideo);

      setSubmitting(true);
      try {
        const res = await instructorUpdateCourse(courseId!, formData);
        toast.success(res.message);
        navigate("/instructor/courses");
      } catch (error: any) {
        toast.error(error?.response?.data.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, categoryRes] = await Promise.all([
          instructorGetCourseById(courseId!),
          getInstructorCategories(),
        ]);

        const course = courseRes?.data;

        formik.setValues({
          courseName: course.courseName || "",
          description: course.description || "",
          category: course.category?._id || "",
          price: course.price || "",
          duration: course.duration || "",
          level: (course.level || "").toLowerCase(),
          thumbnail: null,
          demoVideo: null,
        });

        setExistingThumbnailUrl(course.thumbnailSignedUrl || null);
        setExistingDemoVideoUrl(course.demoVideo?.urlSigned || null);
        setCategories(categoryRes || []);
        setInitialLoading(false);
      } catch (err) {
        toast.error("Failed to load course");
        navigate("/instructor/courses");
      }
    })();
  }, [courseId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setThumbnailError("Only JPG, PNG, WEBP images are allowed");
      formik.setFieldValue("thumbnail", null);
      e.currentTarget.value = "";
      return;
    }

    setThumbnailError("");
    formik.setFieldValue("thumbnail", file);

    const reader = new FileReader();
    reader.onload = () => setExistingThumbnailUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setVideoError("Only MP4, WEBM, or QuickTime videos are allowed");
      formik.setFieldValue("demoVideo", null);
      e.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setVideoError(`Video size must be under ${MAX_VIDEO_SIZE_MB}MB`);
      formik.setFieldValue("demoVideo", null);
      e.currentTarget.value = "";
      return;
    }

    setVideoError("");
    formik.setFieldValue("demoVideo", file);

    const reader = new FileReader();
    reader.onload = () => setExistingDemoVideoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (initialLoading)
    return <p className="p-4 text-white text-center">Loading...</p>;

  return (
    <div className="px-6 py-10 bg-[#121a29] min-h-screen text-white">
      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="space-y-6 max-w-5xl mx-auto p-6 bg-gray-900/80 rounded-3xl shadow-2xl backdrop-blur-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-orange-400 text-center">
            Edit Course
          </h2>

          {/* Top Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField name="courseName" label="Course Name" />
            <InputField name="duration" label="Duration (hours)" />

            <div>
              <label className="block mb-1 font-medium">Level</label>
              <select
                name="level"
                value={formik.values.level}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {formik.touched.level && formik.errors.level && (
                <p className="text-red-500 text-sm">{formik.errors.level}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <select
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-red-500 text-sm">{formik.errors.category}</p>
              )}
            </div>
            <InputField name="price" label="Price" type="number" />
          </div>

          {/* Description */}
          <InputField name="description" label="Description" />

          {/* Thumbnail & Demo Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Thumbnail */}
            <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-md">
              <label className="block mb-2 font-medium text-orange-400">
                Thumbnail
              </label>
              {existingThumbnailUrl && (
                <img
                  src={existingThumbnailUrl}
                  alt="Thumbnail Preview"
                  className="w-full h-52 object-contain rounded mb-2 border border-gray-600"
                />
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailError && (
                <p className="text-red-500 text-sm mt-1">{thumbnailError}</p>
              )}
            </div>

            {/* Demo Video */}
            <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-md">
              <label className="block mb-2 font-medium text-yellow-400">
                Demo Video
              </label>
              {existingDemoVideoUrl && (
                <video
                  src={existingDemoVideoUrl}
                  controls
                  className="w-full h-52 rounded mb-2 border border-gray-600"
                />
              )}
              <input
                ref={videoInputRef}
                type="file"
                name="demoVideo"
                accept="video/*"
                onChange={handleVideoChange}
              />
              {videoError && (
                <p className="text-red-500 text-sm mt-1">{videoError}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="text-center mt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl shadow-lg text-white font-semibold transition-transform transform hover:scale-105 ${
                submitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500"
              }`}
            >
              {submitting ? "Updating..." : "Update Course"}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default CourseEditPage;
