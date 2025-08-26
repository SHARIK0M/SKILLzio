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
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
          Explore Courses
        </h1>
        <p className="mt-2 text-gray-600">
          Discover the best courses for your learning journey
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for courses..."
          className="px-4 py-3 w-full sm:w-2/3 md:w-1/2 rounded-2xl shadow-lg border border-gray-200 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-10">
          {/* Categories */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === cat._id
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat.categoryName}
                </li>
              ))}
            </ul>
          </div>

          {/* Sort Options */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              Sort By
            </h3>
            <ul className="space-y-2">
              <li
                onClick={() => setSortOption("price-asc")}
                className="cursor-pointer hover:text-emerald-600 hover:underline transition-all duration-300"
              >
                Price: Low to High
              </li>
              <li
                onClick={() => setSortOption("price-desc")}
                className="cursor-pointer hover:text-emerald-600 hover:underline transition-all duration-300"
              >
                Price: High to Low
              </li>
              <li
                onClick={() => setSortOption("name-asc")}
                className="cursor-pointer hover:text-emerald-600 hover:underline transition-all duration-300"
              >
                A - Z
              </li>
              <li
                onClick={() => setSortOption("name-desc")}
                className="cursor-pointer hover:text-emerald-600 hover:underline transition-all duration-300"
              >
                Z - A
              </li>
            </ul>

            <button
              onClick={handleClearFilters}
              className="mt-4 w-full px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-2xl shadow transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Courses Grid */}
        <main className="w-full lg:w-3/4 space-y-6">
          <p className="text-gray-600">
            Showing <strong>{courses.length}</strong> course
            {courses.length > 1 ? "s" : ""} for you
          </p>

          {courses.length === 0 ? (
            <div className="text-center text-gray-500 py-16 bg-white rounded-3xl shadow-lg">
              No courses found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(({ course }) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  title={course.courseName}
                  description={course.description}
                  price={course.price}
                  duration={course.duration}
                  level={course.level}
                  thumbnailUrl={course.thumbnailUrl}
                  categoryName={course.category?.categoryName || ""}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-xl font-medium border transition-all duration-300 ${
                    currentPage === i + 1
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseListPage;
