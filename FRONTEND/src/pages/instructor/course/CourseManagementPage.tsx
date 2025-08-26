import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBook,
  FaLayerGroup,
  FaDollarSign,
  FaClock,
  FaVideo,
  FaTag,
  FaAlignLeft,
} from "react-icons/fa";

import {
  instructorGetCourseById,
  publishCourse,
} from "../../../api/action/InstructorActionApi";
import Card from "../../../components/common/Card";

const CourseManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCourseDetails = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await instructorGetCourseById(courseId);
      setCourse(res?.data || {});
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handlePublish = async () => {
    if (!courseId) return;
    try {
      const res = await publishCourse(courseId);
      toast.success(res?.message || "Course published successfully");
      fetchCourseDetails();
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || "Publish failed";
      toast.error(errMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#121a29]">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 text-red-400 font-semibold bg-[#121a29] min-h-[60vh]">
        Course not found
      </div>
    );
  }

  return (
    <div className="px-6 py-10 space-y-8 bg-[#121a29] min-h-screen">
      {/* Course Details Card */}
      <Card
        title="Course Details"
        padded
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl shadow-2xl text-white"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Course Name */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-orange-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-orange-400 mb-1">
                <FaBook /> Course Name:
              </p>
              <p className="text-gray-200 text-lg">{course.courseName}</p>
            </div>

            {/* Level */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-orange-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-orange-400 mb-1">
                <FaLayerGroup /> Level:
              </p>
              <p className="text-gray-200 text-lg">{course.level}</p>
            </div>

            {/* Description */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-orange-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-orange-400 mb-1">
                <FaAlignLeft /> Description:
              </p>
              <p className="whitespace-pre-wrap text-gray-300">
                {course.description}
              </p>
            </div>

            {/* Thumbnail */}
            {course.thumbnailSignedUrl && (
              <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-orange-500 shadow-lg hover:shadow-2xl transition-shadow">
                <p className="flex items-center gap-2 font-semibold text-orange-400 mb-2">
                  <FaVideo /> Thumbnail:
                </p>
                <img
                  src={course.thumbnailSignedUrl}
                  alt="Course Thumbnail"
                  className="w-full rounded-2xl border border-gray-600 shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-yellow-400 mb-1">
                <FaTag /> Category:
              </p>
              <p className="text-gray-200 text-lg">
                {course.category.categoryName}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-yellow-400 mb-1">
                <FaDollarSign /> Price:
              </p>
              <p className="text-gray-200 text-lg">₹{course.price}</p>
            </div>

            {/* Duration */}
            <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:shadow-2xl transition-shadow">
              <p className="flex items-center gap-2 font-semibold text-yellow-400 mb-1">
                <FaClock /> Duration:
              </p>
              <p className="text-gray-200 text-lg">{course.duration} hours</p>
            </div>

            {/* Demo Video */}
            {course.demoVideo?.urlSigned && (
              <div className="bg-gray-900/70 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:shadow-2xl transition-shadow">
                <p className="flex items-center gap-2 font-semibold text-yellow-400 mb-2">
                  <FaVideo /> Demo Video:
                </p>
                <video
                  src={course.demoVideo.urlSigned}
                  controls
                  className="w-full rounded-2xl border border-gray-600 shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <button
          onClick={() => navigate(`/instructor/course/${courseId}/chapters`)}
          className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold transition-transform transform hover:scale-105"
        >
          📚 View Chapters
        </button>

        <button
          onClick={() => navigate(`/instructor/course/${courseId}/quiz`)}
          className="bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold transition-transform transform hover:scale-105"
        >
          🧠 View Quiz
        </button>

        {course.isPublished ? (
          <button
            disabled
            className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold opacity-70 cursor-not-allowed"
          >
            ✅ Course Published
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold transition-transform transform hover:scale-105"
          >
            🚀 Publish Course
          </button>
        )}

        <button
          onClick={() => navigate(`/instructor/courseDashboard/${courseId}`)}
          className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold transition-transform transform hover:scale-105"
        >
          📊 View Course Dashboard
        </button>
      </div>
    </div>
  );
};

export default CourseManagementPage;
