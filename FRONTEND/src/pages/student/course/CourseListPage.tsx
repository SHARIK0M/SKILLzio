import { useEffect, useState } from "react";
import {
  CoursesFiltered,
  getAllCategories,
} from "../../../api/action/StudentAction";
import CourseCard from "../../../components/studentComponent/CourseCard";
import { toast } from "react-toastify";

interface Course {
  _id: string;
  courseName: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  thumbnailUrl: string;
  category?: {
    _id: string;
    categoryName: string;
  };
}

interface CourseResponse {
  course: Course;
  chapterCount: number;
  quizQuestionCount: number;
}

interface Category {
  _id: string;
  categoryName: string;
}

const CourseListPage = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [sortOption, setSortOption] = useState<
    "name-asc" | "name-desc" | "price-asc" | "price-desc"
  >("name-asc");

  const coursesPerPage = 8;

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, debouncedSearch, sortOption, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await CoursesFiltered(
        currentPage,
        coursesPerPage,
        debouncedSearch,
        sortOption,
        selectedCategory
      );
      const { data, total } = response;
      setCourses(data as CourseResponse[]);
      setTotalPages(Math.ceil(total / coursesPerPage));
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSortOption("name-asc");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <div className="relative bg-white shadow-xl border-b border-gray-100 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Explore Amazing Courses 📚
            </h1>
            <p className="text-gray-600 font-medium text-lg">
              Discover the best courses for your learning journey
            </p>
          </div>

          {/* Enhanced Search Section */}
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20"></div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for courses..."
                className="relative w-full px-6 py-4 text-lg border-0 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500 font-medium"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <div className="w-6 h-6 text-gray-400">🔍</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20"></div>
              <div className="relative p-6 space-y-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Filter Courses
                  </h3>
                </div>

                {/* Categories Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>Categories</span>
                  </h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setSelectedCategory(cat._id);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg font-medium ${
                          selectedCategory === cat._id
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200 shadow-emerald-200/50"
                            : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        }`}
                      >
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    <span>Sort By</span>
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSortOption("price-asc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg font-medium ${
                        sortOption === "price-asc"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => setSortOption("price-desc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg font-medium ${
                        sortOption === "price-desc"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => setSortOption("name-asc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg font-medium ${
                        sortOption === "name-asc"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      A - Z
                    </button>
                    <button
                      onClick={() => setSortOption("name-desc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg font-medium ${
                        sortOption === "name-desc"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      Z - A
                    </button>
                  </div>
                </div>

                {/* Enhanced Clear Filter Button */}
                <button
                  onClick={handleClearFilters}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200 hover:border-red-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Enhanced Main Content */}
          <main className="w-full lg:w-3/4">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 -m-4"></div>
              <div className="relative p-6">
                {/* Results Header */}
                <div className="mb-8 text-center">
                  <p className="text-lg font-medium text-gray-700 flex items-center justify-center space-x-2">
                    <span>📚</span>
                    <span>
                      Showing{" "}
                      <strong className="text-emerald-600">
                        {courses.length}
                      </strong>{" "}
                      amazing course{courses.length !== 1 ? "s" : ""} for you
                    </span>
                  </p>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No courses found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {courses.map(({ course }) => (
                        <div key={course._id} className="relative group">
                          {/* Course card wrapper with enhanced styling */}
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative transform group-hover:scale-105 transition-all duration-300">
                            <CourseCard
                              id={course._id}
                              title={course.courseName}
                              description={course.description}
                              price={course.price}
                              duration={course.duration}
                              level={course.level}
                              thumbnailUrl={course.thumbnailUrl}
                              categoryName={course.category?.categoryName || ""}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 -m-2"></div>
                          <div className="relative p-4">
                            <div className="flex justify-center items-center gap-3 flex-wrap">
                              {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                                    currentPage === i + 1
                                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border border-emerald-200 shadow-emerald-200/50"
                                      : "bg-white/80 text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseListPage;
