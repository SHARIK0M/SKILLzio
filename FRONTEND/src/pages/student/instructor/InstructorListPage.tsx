import { useEffect, useState } from "react";
import {
  listInstructors,
  getSkillAndExpertise,
} from "../../../api/action/StudentAction";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Instructor {
  _id: string;
  username: string;
  profilePicUrl?: string;
  skills?: string[];
  expertise?: string[];
}

const InstructorListPage = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");

  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [allExpertise, setAllExpertise] = useState<string[]>([]);

  const navigate = useNavigate();
  const instructorsPerPage = 5;

  // Fetch filters only once
  const fetchFilters = async () => {
    try {
      const response = await getSkillAndExpertise();
      console.log("Full response:", response); // Add this line
      console.log("Skills:", response.skills); // Add this line
      console.log("Expertise:", response.expertise); // Add this line
      setAllSkills(response.skills || []);
      setAllExpertise(response.expertise || []);
    } catch (error) {
      console.log("Error details:", error); // Make this more detailed
      toast.error("Failed to load filters");
    }
  };

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await listInstructors({
        page: currentPage,
        limit: instructorsPerPage,
        search: debouncedSearch,
        sort: sortOrder,
        skill: selectedSkill,
        expertise: selectedExpertise,
      });

      setInstructors(response.data);
      setTotalPages(Math.ceil(response.total / instructorsPerPage));
    } catch (error) {
      toast.error("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters(); // load skills and expertise only once
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    fetchInstructors();
  }, [
    currentPage,
    debouncedSearch,
    sortOrder,
    selectedSkill,
    selectedExpertise,
  ]);

  const handleClearFilter = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSortOrder("asc");
    setSelectedSkill("");
    setSelectedExpertise("");
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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Find Your Perfect Instructor 🎯
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              Discover expert instructors who match your learning goals
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
                placeholder="Search instructor by name..."
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
                    Filter Instructors
                  </h3>
                </div>

                {/* Skills Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setSelectedExpertise("");
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border shadow-md hover:shadow-lg transform hover:scale-105 ${
                          selectedSkill === skill
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200 shadow-emerald-200/50"
                            : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expertise Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    <span>Expertise</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allExpertise.map((exp) => (
                      <button
                        key={exp}
                        onClick={() => {
                          setSelectedExpertise(exp);
                          setSelectedSkill("");
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border shadow-md hover:shadow-lg transform hover:scale-105 ${
                          selectedExpertise === exp
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200 shadow-emerald-200/50"
                            : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Sort By</span>
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg ${
                        sortOrder === "asc"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-200"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      A - Z
                    </button>
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border shadow-md hover:shadow-lg ${
                        sortOrder === "desc"
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
                  onClick={handleClearFilter}
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
                    <span>🎉</span>
                    <span>
                      We found{" "}
                      <strong className="text-emerald-600">
                        {instructors.length}
                      </strong>{" "}
                      amazing instructors for you!
                    </span>
                  </p>
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium">
                        Loading amazing instructors...
                      </span>
                    </div>
                  </div>
                ) : instructors.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No instructors found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {instructors.map((instructor) => (
                        <div
                          key={instructor._id}
                          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                        >
                          {/* Card decoration */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>

                          <div className="relative flex flex-col items-center text-center space-y-4">
                            {/* Enhanced Profile Picture */}
                            <div className="relative">
                              <div className="w-24 h-24 rounded-2xl overflow-hidden border-3 border-white shadow-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5">
                                <div className="w-full h-full rounded-2xl overflow-hidden">
                                  <img
                                    src={
                                      instructor.profilePicUrl ||
                                      "/default-avatar.png"
                                    }
                                    alt={instructor.username}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              {/* Online status indicator */}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
                            </div>

                            {/* Instructor Info */}
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {instructor.username}
                              </h3>
                              <div className="flex flex-wrap justify-center gap-1">
                                {instructor.skills
                                  ?.slice(0, 3)
                                  .map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200"
                                    >
                                      {skill}
                                    </span>
                                  )) || (
                                  <span className="text-sm text-gray-500 italic">
                                    No skills listed
                                  </span>
                                )}
                                {instructor.skills &&
                                  instructor.skills.length > 3 && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                      +{instructor.skills.length - 3} more
                                    </span>
                                  )}
                              </div>
                            </div>

                            {/* Enhanced View Details Button */}
                            <button
                              onClick={() =>
                                navigate(`/user/instructor/${instructor._id}`)
                              }
                              className="group relative w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-emerald-200"
                            >
                              <span className="flex items-center justify-center space-x-2">
                                <span>View Details</span>
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                                  →
                                </span>
                              </span>
                            </button>
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
                                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                                    currentPage === i + 1
                                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border border-emerald-200 shadow-emerald-200/50"
                                      : "bg-white/80 text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                  }`}
                                  onClick={() => setCurrentPage(i + 1)}
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

export default InstructorListPage;
