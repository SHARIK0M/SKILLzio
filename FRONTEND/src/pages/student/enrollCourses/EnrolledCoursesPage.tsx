import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEnrolledCourses,
  getCertificate,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface Course {
  _id: string;
  courseName: string;
  thumbnailUrl: string;
  price: number;
}

interface Enrollment {
  _id: string;
  courseId: Course;
  completionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  certificateGenerated: boolean;
}

const EnrolledCoursesPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const response = await getEnrolledCourses();
        setEnrollments(response.courses);
      } catch (error) {
        toast.error("Failed to load enrolled courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolled();
  }, []);

  const handleDownloadCertificate = async (courseId: string) => {
    try {
      const response = await getCertificate(courseId);
      if (response.success && response.certificateUrl) {
        const link = document.createElement("a");
        link.href = response.certificateUrl;
        link.download = `certificate-${courseId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(response.message || "Certificate not available yet");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to download certificate");
    }
  };

  if (loading)
    return (
      <div className="relative min-h-screen">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48 -z-10"></div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Loading enrolled courses...
            </p>
          </div>
        </div>
      </div>
    );

  if (enrollments.length === 0)
    return (
      <div className="relative min-h-screen">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-32 translate-y-32 -z-10"></div>

        <div className="relative flex items-center justify-center min-h-screen p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6">
              <span className="text-white text-2xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              No Enrolled Courses
            </h2>
            <p className="text-gray-600 mb-6">
              Browse and enroll in a course to see it here.
            </p>
            <button
              onClick={() => navigate("/user/courses")}
              className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Browse Courses</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen">
      {/* Background decorations matching student layout */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-32 translate-y-32 -z-10"></div>

      <div className="relative p-6 max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🎓</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Your Enrolled Courses
                </h2>
                <p className="text-gray-600 font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Continue your learning journey</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-emerald-600 font-semibold">
                    {enrollments.length} Course
                    {enrollments.length !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enroll) => {
            const course = enroll.courseId;
            const isCompleted = enroll.completionStatus === "COMPLETED";

            return (
              <div key={enroll._id} className="group relative">
                {/* Card background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-white/90 backdrop-blur-sm border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden group-hover:scale-[1.02] transform">
                  {/* Image container with overlay */}
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.courseName}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                          isCompleted
                            ? "bg-emerald-100/90 text-emerald-800 border-emerald-200"
                            : enroll.completionStatus === "IN_PROGRESS"
                            ? "bg-yellow-100/90 text-yellow-800 border-yellow-200"
                            : "bg-gray-100/90 text-gray-700 border-gray-200"
                        }`}
                      >
                        <span>
                          {isCompleted
                            ? "✅"
                            : enroll.completionStatus === "IN_PROGRESS"
                            ? "🔄"
                            : "⏳"}
                        </span>
                        <span className="capitalize">
                          {enroll.completionStatus
                            .toLowerCase()
                            .replace("_", " ")}
                        </span>
                      </span>
                    </div>

                    {/* Price tag */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 font-bold rounded-full shadow-md border border-white/50">
                        <span>💰</span>
                        <span>₹{course.price}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow p-6 flex flex-col justify-between space-y-4">
                    <div
                      className="cursor-pointer space-y-3"
                      onClick={() => navigate(`/user/enrolled/${course._id}`)}
                    >
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                        {course.courseName}
                      </h3>

                      {/* Progress indicator */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">
                            Progress
                          </span>
                          <span
                            className={`font-bold ${
                              isCompleted ? "text-emerald-600" : "text-gray-500"
                            }`}
                          >
                            {isCompleted
                              ? "100%"
                              : enroll.completionStatus === "IN_PROGRESS"
                              ? "In Progress"
                              : "0%"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCompleted
                                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 w-full"
                                : enroll.completionStatus === "IN_PROGRESS"
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500 w-2/3"
                                : "bg-gray-300 w-0"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate button */}
                    <div className="pt-4 border-t border-gray-100">
                      {enroll.certificateGenerated ? (
                        <button
                          onClick={() => handleDownloadCertificate(course._id)}
                          className="group w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>🎓</span>
                            <span>Download Certificate</span>
                            <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                              ⬇️
                            </span>
                          </span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-3 rounded-2xl bg-gray-200 text-gray-500 font-medium cursor-not-allowed border border-gray-300/50"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>⏳</span>
                            <span>Certificate Not Ready</span>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="relative mt-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">📚</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {enrollments.length}
                </div>
                <div className="text-gray-600 font-medium">Total Courses</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">✅</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {
                    enrollments.filter(
                      (e) => e.completionStatus === "COMPLETED"
                    ).length
                  }
                </div>
                <div className="text-gray-600 font-medium">Completed</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">🎓</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {enrollments.filter((e) => e.certificateGenerated).length}
                </div>
                <div className="text-gray-600 font-medium">Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCoursesPage;
