import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSpecificCourse,
  markChapterAsCompleted,
  checkChapterCompletedOrNot,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface Chapter {
  _id: string;
  chapterTitle: string;
  videoUrl: string;
}

interface Quiz {
  _id: string;
  title: string;
  totalQuestions: number;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
}

interface Course {
  _id: string;
  courseName: string;
  description: string;
  thumbnailUrl: string;
  demoVideo?: {
    type: string;
    url: string;
  };
  chapters: Chapter[];
  quizzes: Quiz[];
}

interface Enrollment {
  _id: string;
  courseId: Course;
  completedChapters: { chapterId: string }[];
}

const EnrolledCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = (user?.name || "Guest").toUpperCase();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await getSpecificCourse(courseId!);
        setEnrollment(response.enrollment);
        setCompletedChapterIds(
          response.enrollment.completedChapters.map(
            (c: { chapterId: string }) => c.chapterId
          )
        );
      } catch (err) {
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  const handleMarkCompleted = async (chapterId: string) => {
    try {
      await markChapterAsCompleted(courseId!, chapterId);
      setCompletedChapterIds((prev) => [...prev, chapterId]);
      toast.success("Chapter marked as completed!");
    } catch (err) {
      toast.error("Failed to mark chapter as completed");
    }
  };

  const calculateProgress = () => {
    if (!enrollment) return 0;
    return Math.round(
      (completedChapterIds.length / enrollment.courseId.chapters.length) * 100
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-2xl">❌</span>
          </div>
          <p className="text-gray-600 mb-6">No course found.</p>
          <button
            onClick={() => navigate("/user/enrolled")}
            className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <span>←</span>
              <span>Back to Courses</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  const course = enrollment.courseId;
  const currentChapter = course.chapters[currentChapterIndex];
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-32 translate-y-32 -z-10"></div>

      {/* Enhanced Top Navbar */}
      <nav className="relative bg-white/90 backdrop-blur-sm shadow-xl border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="relative px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  SKILLZIO
                </span>
              </div>
              <div className="h-6 w-px bg-gradient-to-b from-emerald-500/20 to-cyan-500/20"></div>
              <button
                onClick={() => navigate("/user/enrolled")}
                className="group text-gray-600 hover:text-emerald-600 text-sm flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-all duration-300"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                  ←
                </span>
                <span>Back to Courses</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {username}
                </p>
                <p className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Student</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        👤
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Enhanced Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? "w-20" : "w-96"
          } bg-white/90 backdrop-blur-sm shadow-xl flex flex-col transition-all duration-500 ease-in-out border-r border-white/20 relative`}
        >
          {/* Sidebar background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>

          <div className="relative p-6 border-b border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ${
                  sidebarCollapsed ? "hidden" : "text-xl"
                }`}
              >
                {course.courseName}
              </h2>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-3 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-md hover:shadow-lg border border-white/50 bg-white/80 backdrop-blur-sm group"
              >
                <svg
                  className={`w-5 h-5 text-emerald-600 transform transition-transform duration-300 ${
                    sidebarCollapsed ? "rotate-180" : ""
                  } group-hover:scale-110`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      {progress}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <span>📊</span>
                    <span>
                      {completedChapterIds.length} of {course.chapters.length}{" "}
                      chapters completed
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="relative flex-1 overflow-y-auto">
            <div className="p-6">
              {!sidebarCollapsed && (
                <h3 className="text-xs text-gray-500 uppercase mb-6 tracking-widest font-bold flex items-center space-x-2">
                  <span>📚</span>
                  <span>Course Chapters</span>
                </h3>
              )}
              <div className="space-y-3">
                {course.chapters.map((chapter, index) => {
                  const isCompleted = completedChapterIds.includes(chapter._id);
                  const isCurrent = index === currentChapterIndex;

                  return (
                    <div
                      key={chapter._id}
                      onClick={() => setCurrentChapterIndex(index)}
                      className={`group cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                        isCurrent
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl scale-[1.02]"
                          : "hover:bg-white/80 hover:shadow-lg text-gray-700 bg-white/60 backdrop-blur-sm border border-white/50"
                      }`}
                    >
                      <div className="p-4 flex items-center space-x-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300 ${
                            isCurrent
                              ? "bg-white text-emerald-600 scale-110"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-600 scale-105"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold truncate ${
                                isCurrent ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {chapter.chapterTitle}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  isCurrent
                                    ? "bg-white/20 text-white"
                                    : isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <span>{isCompleted ? "✅" : "⏳"}</span>
                                <span>
                                  {isCompleted ? "Completed" : "Pending"}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Enhanced Quiz Button */}
                {course.quizzes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200/50">
                    <button
                      onClick={async () => {
                        try {
                          const res = await checkChapterCompletedOrNot(
                            course._id
                          );
                          if (res?.allCompleted) {
                            navigate(
                              `/user/quiz/${course._id}/${course.quizzes[0]._id}`
                            );
                          } else {
                            toast.warning(
                              "Please complete all chapters before attempting the quiz."
                            );
                          }
                        } catch {
                          toast.error(
                            "Unable to check chapter completion status."
                          );
                        }
                      }}
                      className={`group w-full flex items-center justify-center px-6 py-4 ${
                        sidebarCollapsed
                          ? "justify-center text-[0px] p-4"
                          : "text-sm font-bold"
                      } text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
                      title="Start Quiz"
                    >
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.752 11.168l-5.197-3.03A1 1 0 008 9.03v5.939a1 1 0 001.555.832l5.197-3.03a1 1 0 000-1.732z"
                          />
                        </svg>
                      </div>
                      {!sidebarCollapsed && (
                        <span className="flex items-center space-x-2">
                          <span>🎯 Start Quiz</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative">
          {/* Content header */}
          <div className="relative p-6 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">📹</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {currentChapter.chapterTitle}
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>📝</span>
                  <span>
                    Chapter {currentChapterIndex + 1} of{" "}
                    {course.chapters.length}
                  </span>
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center space-x-1">
                  <span>⏱️</span>
                  <span>{progress}% Course Progress</span>
                </span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="flex-1 p-6">
            <div className="bg-black/90 rounded-3xl overflow-hidden h-full max-h-[60vh] shadow-2xl border border-white/20">
              <video
                controls
                key={currentChapter._id}
                className="w-full h-full object-contain"
                onEnded={() => {
                  if (!completedChapterIds.includes(currentChapter._id)) {
                    handleMarkCompleted(currentChapter._id);
                  }
                }}
              >
                <source src={currentChapter.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Enhanced Control Bar */}
          <div className="relative p-6 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative flex justify-between items-center">
              <button
                disabled={currentChapterIndex === 0}
                onClick={() => setCurrentChapterIndex((prev) => prev - 1)}
                className="group px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
              >
                <span className="flex items-center space-x-2">
                  <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                    ←
                  </span>
                  <span className="font-semibold">Previous Chapter</span>
                </span>
              </button>

              <div className="text-center space-y-1">
                <div className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Chapter {currentChapterIndex + 1} of {course.chapters.length}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  🎯 {progress}% Complete
                </div>
              </div>

              <button
                disabled={currentChapterIndex === course.chapters.length - 1}
                onClick={() => setCurrentChapterIndex((prev) => prev + 1)}
                className="group px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 font-semibold"
              >
                <span className="flex items-center space-x-2">
                  <span>Next Chapter</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnrolledCourseDetailPage;
