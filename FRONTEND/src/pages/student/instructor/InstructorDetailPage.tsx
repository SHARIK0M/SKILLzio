import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { instructorDetailsById } from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface Instructor {
  _id: string;
  username: string;
  email: string;
  mobileNo?: string;
  profilePicUrl?: string;
  skills?: string[];
  expertise?: string[];
}

const InstructorDetailPage = () => {
  const { instructorId } = useParams<{ instructorId: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      const response = await instructorDetailsById(instructorId!);
      setInstructor(response.data);
    } catch (err) {
      toast.error("Failed to load instructor details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId) {
      fetchInstructor();
    }
  }, [instructorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium text-lg">
              Loading instructor details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl flex items-center justify-center">
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Instructor not found
          </h3>
          <p className="text-gray-500">
            The instructor you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <div className="relative bg-white shadow-xl border-b border-gray-100 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Enhanced Profile Picture */}
            <div className="relative">
              <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-1">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={instructor.profilePicUrl || "/default-avatar.png"}
                    alt={instructor.username}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
                <span className="w-3 h-3 bg-white rounded-full"></span>
              </div>
            </div>

            {/* Enhanced Instructor Info */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {instructor.username} 👨‍🏫
                </h2>
                <p className="text-gray-600 font-medium flex items-center justify-center md:justify-start space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Professional Instructor & Expert</span>
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-700">
                  <span className="text-lg">📧</span>
                  <span className="font-medium">{instructor.email}</span>
                </div>
                {instructor.mobileNo && (
                  <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-700">
                    <span className="text-lg">📱</span>
                    <span className="font-medium">{instructor.mobileNo}</span>
                  </div>
                )}
              </div>

              {/* Enhanced Book Appointment Button */}
              <div className="pt-4">
                <button
                  onClick={() =>
                    navigate(`/user/instructor/${instructor._id}/slots`)
                  }
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-emerald-200"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span>📅</span>
                    <span>Book an Appointment</span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 -m-4"></div>
          <div className="relative p-8 space-y-8">
            {/* Skills Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span>Skills & Specializations</span>
              </h3>
              {instructor.skills && instructor.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {instructor.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-2xl font-semibold border border-emerald-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🤔</span>
                  </div>
                  <p className="text-gray-500 font-medium">No skills listed</p>
                </div>
              )}
            </div>

            {/* Expertise Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                <span>Areas of Expertise</span>
              </h3>
              {instructor.expertise && instructor.expertise.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instructor.expertise.map((exp, index) => (
                    <div
                      key={index}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                        <span className="text-gray-700 font-semibold">
                          {exp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-gray-500 font-medium">
                    No expertise provided
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() =>
                  navigate(`/user/instructor/${instructor._id}/slots`)
                }
                className="group flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-emerald-200"
              >
                <span className="flex items-center justify-center space-x-3">
                  <span>📅</span>
                  <span>Book an Appointment</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              </button>

              <button
                onClick={() => navigate(-1)}
                className="group px-6 py-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                    ←
                  </span>
                  <span>Back to Instructors</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailPage;
