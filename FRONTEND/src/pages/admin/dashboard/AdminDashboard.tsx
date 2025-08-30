import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboard,
  getCourseReport,
  getMembershipCourseReport,
  exportReport,
} from "../../../api/action/AdminActionApi"; // Adjust path as needed
import {
  FileText,
  Download,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";

// Interfaces
interface SalesData {
  month: number;
  year: number;
  total: number;
}

interface TopCourse {
  courseName: string;
  salesCount: number;
}

interface TopCategory {
  categoryName: string;
}

interface DashboardData {
  instructorCount: number;
  mentorCount: number;
  courseCount: number;
  courseRevenue: number;
  membershipRevenue: number;
  courseSalesGraph: SalesData[];
  membershipSalesGraph: SalesData[];
  topCourses: TopCourse[];
  topCategories: TopCategory[];
}

interface ReportFilter {
  type: "daily" | "weekly" | "monthly" | "custom";
  startDate?: Date;
  endDate?: Date;
}

// Updated to match the grouped structure from the backend
interface CourseReportRow {
  orderId: string;
  date: Date;
  courses: {
    courseName: string;
    instructorName: string;
    coursePrice: number;
    adminShare: number;
  }[];
  totalPrice: number;
  totalAdminShare: number;
}

interface MembershipReportRow {
  orderId: string;
  planName: string;
  instructorName: string;
  price: number;
  date: Date;
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [courseReport, setCourseReport] = useState<CourseReportRow[]>([]);
  const [membershipReport, setMembershipReport] = useState<
    MembershipReportRow[]
  >([]);
  const [courseReportTotals, setCourseReportTotals] = useState<{
    totalAdminShare: number;
  }>({ totalAdminShare: 0 });
  const [membershipReportTotals, setMembershipReportTotals] = useState<{
    totalRevenue: number;
    totalSales: number;
  }>({ totalRevenue: 0, totalSales: 0 });
  const [filter, setFilter] = useState<ReportFilter>({ type: "monthly" });
  const [courseCurrentPage, setCourseCurrentPage] = useState<number>(1);
  const [courseTotalPages, setCourseTotalPages] = useState<number>(1);
  const [membershipCurrentPage, setMembershipCurrentPage] = useState<number>(1);
  const [membershipTotalPages, setMembershipTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showReports, setShowReports] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"course" | "membership">("course");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [dateValidationError, setDateValidationError] = useState<string>("");
  const limit = 1; // Fixed limit for pagination

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Date validation functions
  const validateDates = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) {
      return "Both start date and end date are required";
    }

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Check if end date is in the future
    if (end > today) {
      return "End date cannot be in the future";
    }

    // Check if start date is in the future
    if (start > today) {
      return "Start date cannot be in the future";
    }

    // Check if start date is after end date
    if (start > end) {
      return "Start date cannot be after end date";
    }

    // Check if date range is too large (optional - you can adjust this)
    const daysDifference = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 365) {
      return "Date range cannot exceed 365 days";
    }

    return "";
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setCustomStartDate(newStartDate);

    if (newStartDate && customEndDate) {
      const validationError = validateDates(newStartDate, customEndDate);
      setDateValidationError(validationError);
    } else {
      setDateValidationError("");
    }
    setShowReports(false);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setCustomEndDate(newEndDate);

    if (customStartDate && newEndDate) {
      const validationError = validateDates(customStartDate, newEndDate);
      setDateValidationError(validationError);
    } else {
      setDateValidationError("");
    }
    setShowReports(false);
  };

  const isGenerateButtonDisabled = () => {
    if (reportLoading) return true;

    if (filter.type === "custom") {
      return !customStartDate || !customEndDate || !!dateValidationError;
    }

    return false;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCourseReport = async (page: number = courseCurrentPage) => {
    try {
      setReportLoading(true);
      const reportFilter = {
        ...filter,
        ...(filter.type === "custom" && customStartDate && customEndDate
          ? {
              startDate: new Date(customStartDate),
              endDate: new Date(customEndDate),
            }
          : {}),
      };

      const courseRes = await getCourseReport(reportFilter, page, limit);

      if (courseRes.success) {
        setCourseReport(courseRes.data || []);
        setCourseReportTotals({ totalAdminShare: courseRes.adminShare || 0 });
        setCourseTotalPages(Math.ceil(courseRes.totalItems / limit));
      } else {
        throw new Error("Invalid course report response");
      }
    } catch (err) {
      console.error("Failed to generate course report:", err);
      setError("Failed to generate course report");
    } finally {
      setReportLoading(false);
    }
  };

  const generateMembershipReport = async (
    page: number = membershipCurrentPage
  ) => {
    try {
      setReportLoading(true);
      const reportFilter = {
        ...filter,
        ...(filter.type === "custom" && customStartDate && customEndDate
          ? {
              startDate: new Date(customStartDate),
              endDate: new Date(customEndDate),
            }
          : {}),
      };

      const membershipRes = await getMembershipCourseReport(
        reportFilter,
        page,
        limit
      );

      if (membershipRes.success) {
        setMembershipReport(membershipRes.data || []);
        setMembershipReportTotals({
          totalRevenue: membershipRes.totalRevenue || 0,
          totalSales: membershipRes.totalSales || 0,
        });
        setMembershipTotalPages(Math.ceil(membershipRes.totalItems / limit));
      } else {
        throw new Error("Invalid membership report response");
      }
    } catch (err) {
      console.error("Failed to generate membership report:", err);
      setError("Failed to generate membership report");
    } finally {
      setReportLoading(false);
    }
  };

  const generateReports = async () => {
    try {
      setReportLoading(true);
      await Promise.all([
        generateCourseReport(courseCurrentPage),
        generateMembershipReport(membershipCurrentPage),
      ]);
      setShowReports(true);
    } catch (err) {
      console.error("Failed to generate reports:", err);
      setError("Failed to generate reports");
    } finally {
      setReportLoading(false);
    }
  };

  const handleExport = async (
    reportType: "course" | "membership",
    format: "excel" | "pdf"
  ) => {
    try {
      setExportLoading(true);
      const reportFilter = {
        ...filter,
        ...(filter.type === "custom" && customStartDate && customEndDate
          ? {
              startDate: new Date(customStartDate),
              endDate: new Date(customEndDate),
            }
          : {}),
      };
      await exportReport(reportType, format, reportFilter);
      setError(null);
    } catch (err) {
      console.error("Failed to export report:", err);
      setError(
        `Failed to export ${reportType} report as ${format.toUpperCase()}`
      );
    } finally {
      setExportLoading(false);
    }
  };

  const handleCoursePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= courseTotalPages) {
      setCourseCurrentPage(newPage);
      generateCourseReport(newPage);
    }
  };

  const handleMembershipPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= membershipTotalPages) {
      setMembershipCurrentPage(newPage);
      generateMembershipReport(newPage);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ReportFilter["type"];
    setFilter({ type: selected });
    setShowReports(false);
    setCourseCurrentPage(1);
    setMembershipCurrentPage(1);

    // Reset custom dates and validation errors when switching away from custom
    if (selected !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
      setDateValidationError("");
    }
  };

  const formatGraphData = (sales: SalesData[]) =>
    sales.map((item) => ({
      name: `${monthNames[item.month - 1]} ${item.year}`,
      total: item.total,
    }));

  const getFilterDisplayName = () => {
    switch (filter.type) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "custom":
        return `${customStartDate} to ${customEndDate}`;
      default:
        return "";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111827]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-cyan-400" />
          <p className="text-cyan-300">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111827]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-cyan-600 text-white px-4 py-2 rounded-xl hover:bg-cyan-700 transition-colors border border-cyan-500"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 space-y-10 bg-[#111827] min-h-screen">
      <style>{`
        /* Custom scrollbar for tables and content */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.4);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.7);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.4) transparent;
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#111827] rounded-xl shadow-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-cyan-300">
          Overview of your platform's performance and metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card
          title="Total Instructors"
          value={dashboardData?.instructorCount}
          icon="👨‍🏫"
        />
        <Card
          title="Total Mentors"
          value={dashboardData?.mentorCount}
          icon="🎓"
        />
        <Card
          title="Total Courses"
          value={dashboardData?.courseCount}
          icon="📚"
        />
        <Card
          title="Course Revenue"
          value={`₹${dashboardData?.courseRevenue.toLocaleString()}`}
          green
          icon="💰"
        />
        <Card
          title="Membership Revenue"
          value={`₹${dashboardData?.membershipRevenue.toLocaleString()}`}
          green
          icon="💳"
        />
      </div>

      {/* Top Courses and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] shadow-xl rounded-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">
            Top 3 Courses
          </h3>
          {dashboardData?.topCourses && dashboardData.topCourses.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-cyan-800/30 hover:bg-gray-900/60 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-cyan-400">
                      {index + 1}.
                    </span>
                    <span className="font-medium text-cyan-300">
                      {course.courseName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400 bg-cyan-600/20 px-2 py-1 rounded-lg">
                    {course.salesCount} sales
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyan-300/60">No top courses data available</p>
          )}
        </div>
        <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] shadow-xl rounded-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">
            Top 3 Categories
          </h3>
          {dashboardData?.topCategories &&
          dashboardData.topCategories.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-cyan-800/30 hover:bg-gray-900/60 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-green-400">
                      {index + 1}.
                    </span>
                    <span className="font-medium text-cyan-300">
                      {category.categoryName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cyan-300/60">No top categories data available</p>
          )}
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Graph
          title="Monthly Course Sales"
          data={formatGraphData(dashboardData?.courseSalesGraph || [])}
          color="#22d3ee"
        />
        <Graph
          title="Monthly Membership Sales"
          data={formatGraphData(dashboardData?.membershipSalesGraph || [])}
          color="#10b981"
        />
      </div>

      {/* Report Generation Section */}
      <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] rounded-xl shadow-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-cyan-400">
              Generate Reports
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-cyan-300" />
            <span className="text-sm text-cyan-300">Filter & Generate</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-gray-900/40 rounded-xl mb-6 border border-cyan-800/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Report Type
              </label>
              <select
                className="w-full border border-cyan-800/50 px-3 py-2 rounded-xl bg-[#1e293b] text-cyan-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors"
                value={filter.type}
                onChange={handleFilterChange}
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {filter.type === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className={`w-full border px-3 py-2 rounded-xl bg-[#1e293b] text-cyan-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors ${
                      dateValidationError
                        ? "border-red-400"
                        : "border-cyan-800/50"
                    }`}
                    value={customStartDate}
                    onChange={handleStartDateChange}
                    max={getTodayString()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className={`w-full border px-3 py-2 rounded-xl bg-[#1e293b] text-cyan-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors ${
                      dateValidationError
                        ? "border-red-400"
                        : "border-cyan-800/50"
                    }`}
                    value={customEndDate}
                    onChange={handleEndDateChange}
                    max={getTodayString()}
                    min={customStartDate || undefined}
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <button
                onClick={generateReports}
                disabled={isGenerateButtonDisabled()}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-4 py-2 rounded-xl hover:from-cyan-700 hover:to-cyan-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-400 shadow-lg"
              >
                {reportLoading ? (
                  <RefreshCw className="animate-spin h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>
                  {reportLoading ? "Generating..." : "Generate Reports"}
                </span>
              </button>
            </div>
          </div>

          {/* Date Validation Error */}
          {dateValidationError && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/30 p-3 rounded-xl border border-red-400/50">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{dateValidationError}</span>
            </div>
          )}

          {/* Date Selection Helper Text */}
          {filter.type === "custom" && !dateValidationError && (
            <div className="text-sm text-cyan-300 bg-cyan-900/30 p-3 rounded-xl border border-cyan-400/30">
              <div className="flex items-start space-x-2">
                <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5 text-cyan-400" />
                <div>
                  <p className="font-medium text-cyan-400 mb-1">
                    Date Selection Guidelines:
                  </p>
                  <ul className="text-cyan-300 space-y-1">
                    <li>• End date must be today or earlier</li>
                    <li>• Start date must be before or equal to end date</li>
                    <li>• Maximum date range: 365 days</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Status */}
        {!showReports && !reportLoading && (
          <div className="text-center py-8 text-cyan-300/60">
            <FileText className="h-12 w-12 mx-auto mb-3 text-cyan-400/40" />
            <p>Click "Generate Reports" to view detailed sales data</p>
          </div>
        )}
      </div>

      {/* Reports Display */}
      {showReports && (
        <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] rounded-xl shadow-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
          {/* Report Header with Period */}
          <div className="mb-6 p-4 bg-cyan-900/30 rounded-xl border border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400">
                  Sales Report
                </h3>
                <p className="text-cyan-300">
                  Period: {getFilterDisplayName()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-300">Generated on</p>
                <p className="font-semibold text-cyan-400">
                  {new Date().toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Report Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-900/40 p-1 rounded-xl border border-cyan-800/30">
              <button
                onClick={() => setActiveTab("course")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "course"
                    ? "bg-cyan-600/30 text-cyan-400 shadow-lg border border-cyan-400"
                    : "text-cyan-300 hover:text-cyan-400 hover:bg-gray-900/60"
                }`}
              >
                Course Sales ({courseReport.length})
              </button>
              <button
                onClick={() => setActiveTab("membership")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "membership"
                    ? "bg-green-600/30 text-green-400 shadow-lg border border-green-400"
                    : "text-cyan-300 hover:text-cyan-400 hover:bg-gray-900/60"
                }`}
              >
                Membership Sales ({membershipReport.length})
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport(activeTab, "excel")}
                disabled={
                  exportLoading ||
                  (activeTab === "course"
                    ? courseReport.length === 0
                    : membershipReport.length === 0)
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 border border-green-400 shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>{exportLoading ? "Exporting..." : "Export Excel"}</span>
              </button>
              <button
                onClick={() => handleExport(activeTab, "pdf")}
                disabled={
                  exportLoading ||
                  (activeTab === "course"
                    ? courseReport.length === 0
                    : membershipReport.length === 0)
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-4 py-2 rounded-xl hover:from-cyan-700 hover:to-cyan-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 border border-cyan-400 shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>{exportLoading ? "Exporting..." : "Export PDF"}</span>
              </button>
            </div>
          </div>

          {/* Course Sales Report */}
          {activeTab === "course" && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">
                Course Sales Report
              </h3>
              {courseReport.length > 0 ? (
                <div>
                  <div className="overflow-x-auto mb-4 custom-scrollbar">
                    <table className="min-w-full table-auto border-collapse border border-cyan-800/50 rounded-xl">
                      <thead className="bg-cyan-900/30">
                        <tr>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Order ID
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Date
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Course Name
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Instructor
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Course Price
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Total Price
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Admin Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseReport.map((order) =>
                          order.courses.map((course, courseIdx) => (
                            <tr
                              key={`${order.orderId}-${courseIdx}`}
                              className={
                                courseIdx === order.courses.length - 1
                                  ? "bg-cyan-900/20"
                                  : "hover:bg-gray-900/40 transition-colors"
                              }
                            >
                              <td className="px-4 py-3 border border-cyan-800/50 font-mono text-sm text-cyan-300">
                                {courseIdx === 0 ? order.orderId : ""}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 text-cyan-300/80">
                                {courseIdx === 0
                                  ? new Date(order.date)
                                      .toLocaleDateString("en-GB")
                                      .replace(/\//g, "-")
                                  : ""}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 font-medium text-cyan-300">
                                {course.courseName}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 text-cyan-300/80">
                                {course.instructorName}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 font-semibold text-green-400">
                                ₹{course.coursePrice.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 font-semibold text-cyan-400">
                                {courseIdx === order.courses.length - 1
                                  ? `₹${order.totalPrice.toLocaleString()}`
                                  : ""}
                              </td>
                              <td className="px-4 py-3 border border-cyan-800/50 font-semibold text-cyan-400">
                                {courseIdx === order.courses.length - 1
                                  ? `₹${order.totalAdminShare.toLocaleString()}`
                                  : ""}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Course Pagination Controls */}
                  <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                      onClick={() =>
                        handleCoursePageChange(courseCurrentPage - 1)
                      }
                      disabled={courseCurrentPage === 1}
                      className="px-3 py-1 bg-gray-900/40 text-cyan-300 rounded-xl hover:bg-gray-900/60 disabled:bg-gray-800/40 disabled:cursor-not-allowed border border-cyan-800/30 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-cyan-300">
                      Page {courseCurrentPage} of {courseTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        handleCoursePageChange(courseCurrentPage + 1)
                      }
                      disabled={courseCurrentPage === courseTotalPages}
                      className="px-3 py-1 bg-gray-900/40 text-cyan-300 rounded-xl hover:bg-gray-900/60 disabled:bg-gray-800/40 disabled:cursor-not-allowed border border-cyan-800/30 transition-colors"
                    >
                      Next
                    </button>
                  </div>

                  {/* Course Report Totals */}
                  <div className="bg-cyan-900/30 rounded-xl p-4 border-2 border-cyan-400/50 mt-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                        <span className="font-semibold text-cyan-400">
                          Report Summary
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-cyan-300">
                          Total Admin Revenue
                        </p>
                        <p className="text-2xl font-bold text-cyan-400">
                          ₹{courseReportTotals.totalAdminShare.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-cyan-300/60">
                  <p>No course sales data found for the selected period</p>
                </div>
              )}
            </div>
          )}

          {/* Membership Report */}
          {activeTab === "membership" && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">
                Membership Report
              </h3>
              {membershipReport.length > 0 ? (
                <div>
                  <div className="overflow-x-auto mb-4 custom-scrollbar">
                    <table className="min-w-full table-auto border-collapse border border-cyan-800/50 rounded-xl">
                      <thead className="bg-green-900/30">
                        <tr>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Order ID
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Plan
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Instructor
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Price
                          </th>
                          <th className="px-4 py-3 border border-cyan-800/50 text-left font-semibold text-cyan-300">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {membershipReport.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-900/40 transition-colors"
                          >
                            <td className="px-4 py-3 border border-cyan-800/50 font-mono text-sm text-cyan-300">
                              {row.orderId}
                            </td>
                            <td className="px-4 py-3 border border-cyan-800/50 font-semibold text-cyan-300">
                              {row.planName}
                            </td>
                            <td className="px-4 py-3 border border-cyan-800/50 text-cyan-300/80">
                              {row.instructorName}
                            </td>
                            <td className="px-4 py-3 border border-cyan-800/50 font-semibold text-green-400">
                              ₹{row.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 border border-cyan-800/50 text-cyan-300/80">
                              {new Date(row.date)
                                .toLocaleDateString("en-GB")
                                .replace(/\//g, "-")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Membership Pagination Controls */}
                  <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                      onClick={() =>
                        handleMembershipPageChange(membershipCurrentPage - 1)
                      }
                      disabled={membershipCurrentPage === 1}
                      className="px-3 py-1 bg-gray-900/40 text-cyan-300 rounded-xl hover:bg-gray-900/60 disabled:bg-gray-800/40 disabled:cursor-not-allowed border border-cyan-800/30 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-cyan-300">
                      Page {membershipCurrentPage} of {membershipTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        handleMembershipPageChange(membershipCurrentPage + 1)
                      }
                      disabled={membershipCurrentPage === membershipTotalPages}
                      className="px-3 py-1 bg-gray-900/40 text-cyan-300 rounded-xl hover:bg-gray-900/60 disabled:bg-gray-800/40 disabled:cursor-not-allowed border border-cyan-800/30 transition-colors"
                    >
                      Next
                    </button>
                  </div>

                  {/* Membership Report Totals */}
                  <div className="bg-green-900/30 rounded-xl p-4 border-2 border-green-400/50 mt-4 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <span className="font-semibold text-green-400">
                            Total Revenue
                          </span>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                          ₹
                          {membershipReportTotals.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          <span className="font-semibold text-green-400">
                            Total Sales
                          </span>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                          {membershipReportTotals.totalSales.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-cyan-300/60">
                  <p>No membership sales data found for the selected period</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Card Component
const Card = ({
  title,
  value,
  green = false,
  icon,
}: {
  title: string;
  value: any;
  green?: boolean;
  icon?: string;
}) => (
  <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] shadow-xl rounded-xl p-6 border border-cyan-800/50 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm hover:border-cyan-400/50">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-cyan-300 mb-1">{title}</h3>
        <p
          className={`text-2xl font-bold ${
            green ? "text-green-400" : "text-cyan-400"
          }`}
        >
          {value}
        </p>
      </div>
      {icon && <div className="text-2xl opacity-50">{icon}</div>}
    </div>
  </div>
);

// Enhanced Graph Component
const Graph = ({
  title,
  data,
  color,
}: {
  title: string;
  data: any[];
  color: string;
}) => (
  <div className="bg-gradient-to-b from-[#1e293b] to-[#111827] shadow-xl rounded-xl p-6 border border-cyan-800/50 backdrop-blur-sm">
    <h3 className="text-lg font-semibold mb-4 text-cyan-400">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.2)" />
        <XAxis
          dataKey="name"
          stroke="#22d3ee"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#22d3ee" fontSize={12} />
        <Tooltip
          formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
          labelStyle={{ color: "#22d3ee" }}
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid rgba(34, 211, 238, 0.5)",
            borderRadius: "12px",
            color: "#22d3ee",
          }}
        />
        <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default AdminDashboard;
