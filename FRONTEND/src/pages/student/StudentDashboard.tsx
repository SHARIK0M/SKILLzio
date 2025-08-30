import { useEffect, useState, useCallback } from "react";
import {
  dashboard,
  courseReport,
  slotReport,
  exportCourseReport,
  exportSlotReport,
} from "../../api/action/StudentAction";
import {
  Calendar,
  FileText,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  BookOpen,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Component } from "react";
import { toast } from "react-toastify"; // Import toast for user feedback (ensure react-toastify is installed)

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative bg-gradient-to-r from-red-50 via-pink-50 to-red-50 rounded-2xl p-8 shadow-xl border border-red-100 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>

          <div className="relative text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Something Went Wrong
            </h3>
            <p className="text-red-700 font-medium">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MonthlyPerformanceItem {
  month: number | null;
  year: number | null;
  count: number;
  totalAmount: number;
}

interface DashboardData {
  totalCoursesPurchased: number;
  totalCoursesCompleted: number;
  totalCoursesNotCompleted: number;
  totalCoursePurchaseCost: number;
  totalSlotBookings: number;
  totalSlotBookingCost: number;
  coursePerformance: MonthlyPerformanceItem[];
  slotPerformance: MonthlyPerformanceItem[];
}

interface IStudentCourseReportItem {
  orderId: string;
  date: string;
  courseName: string[] | string;
  price: number[] | number;
  totalCost: number;
}

interface IStudentSlotReportItem {
  bookingId: string;
  date: string;
  slotTime: {
    startTime: string;
    endTime: string;
  };
  instructorName: string;
  price: number;
  totalPrice: number;
}

interface ReportFilter {
  type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
  page: number;
}

const StudentDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [courseReportData, setCourseReportData] = useState<
    IStudentCourseReportItem[]
  >([]);
  const [slotReportData, setSlotReportData] = useState<
    IStudentSlotReportItem[]
  >([]);
  const [courseReportTotals, setCourseReportTotals] = useState<{
    totalCost: number;
    totalOrders: number;
  }>({ totalCost: 0, totalOrders: 0 });
  const [slotReportTotals, setSlotReportTotals] = useState<{
    totalCost: number;
    totalBookings: number;
  }>({ totalCost: 0, totalBookings: 0 });
  const [courseFilter, setCourseFilter] = useState<ReportFilter>({
    type: "monthly",
    page: 1,
  });
  const [slotFilter, setSlotFilter] = useState<ReportFilter>({
    type: "monthly",
    page: 1,
  });
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showReports, setShowReports] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"course" | "slot">("course");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboard();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReports = useCallback(
    async (reportType: "course" | "slot" | "both", page: number = 1) => {
      try {
        setReportLoading(true);
        setError(null);

        // Validate custom dates
        if (
          courseFilter.type === "custom" &&
          (!customStartDate || !customEndDate)
        ) {
          setError("Please select both start and end dates for custom range");
          toast.error(
            "Please select both start and end dates for custom range"
          );
          return;
        }

        const reportFilter = (filter: ReportFilter) => ({
          type: filter.type,
          page,
          ...(filter.type === "custom" && customStartDate && customEndDate
            ? {
                startDate: new Date(customStartDate)
                  .toISOString()
                  .split("T")[0],
                endDate: new Date(customEndDate).toISOString().split("T")[0],
              }
            : {}),
        });

        if (reportType === "course" || reportType === "both") {
          const courseFilterData = reportFilter(courseFilter);
          console.log("Fetching course report with filter:", courseFilterData);
          const courseRes = await courseReport(courseFilterData);
          const courseData = courseRes.data || [];
          console.log("Course report data:", courseData);
          setCourseReportData(courseData);
          const courseTotalCost = courseData.reduce(
            (sum: number, item: IStudentCourseReportItem) =>
              sum + item.totalCost,
            0
          );
          setCourseReportTotals({
            totalCost: courseTotalCost,
            totalOrders: courseData.length,
          });
        }

        if (reportType === "slot" || reportType === "both") {
          const slotFilterData = reportFilter(slotFilter);
          console.log("Fetching slot report with filter:", slotFilterData);
          const slotRes = await slotReport(slotFilterData);
          const slotData = slotRes.data || [];
          console.log("Slot report data:", slotData);
          setSlotReportData(slotData);
          const slotTotalCost = slotData.reduce(
            (sum: number, item: IStudentSlotReportItem) => sum + item.price,
            0
          );
          setSlotReportTotals({
            totalCost: slotTotalCost,
            totalBookings: slotData.length,
          });
        }

        setShowReports(true);
      } catch (err) {
        console.error("Failed to generate reports:", err);
        setError("Failed to generate reports");
        toast.error("Failed to generate reports");
      } finally {
        setReportLoading(false);
      }
    },
    [courseFilter, slotFilter, customStartDate, customEndDate]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as ReportFilter["type"];
    setCourseFilter({ type: selected, page: 1 });
    setSlotFilter({ type: selected, page: 1 });
    setShowReports(false);
    if (selected !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1) return;
      if (activeTab === "course") {
        setCourseFilter((prev) => ({ ...prev, page: newPage }));
        generateReports("course", newPage);
      } else {
        setSlotFilter((prev) => ({ ...prev, page: newPage }));
        generateReports("slot", newPage);
      }
    },
    [activeTab, generateReports]
  );

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    // Prevent selecting dates after today
    if (selectedDate <= today) {
      setCustomStartDate(selectedDate);
      // If endDate is before startDate, reset endDate
      if (customEndDate && selectedDate > customEndDate) {
        setCustomEndDate("");
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    // Prevent selecting dates after today or before startDate
    if (
      selectedDate <= today &&
      (!customStartDate || selectedDate >= customStartDate)
    ) {
      setCustomEndDate(selectedDate);
    }
  };

  const formatChartData = (performance: MonthlyPerformanceItem[]) => {
    return performance.map((item) => ({
      name:
        typeof item.month === "number" && typeof item.year === "number"
          ? `${item.month.toString().padStart(2, "0")}/${item.year}`
          : "Unknown",
      count: item.count,
      totalAmount: item.totalAmount,
    }));
  };

  const getFilterDisplayName = () => {
    const filter = activeTab === "course" ? courseFilter : slotFilter;
    switch (filter.type) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
      case "custom":
        return customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString()} to ${new Date(
              customEndDate
            ).toLocaleDateString()}`
          : "Custom Range";
      default:
        return "";
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 -m-8"></div>

          <div className="relative text-center p-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl">
              <RefreshCw className="animate-spin h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 -m-8"></div>

          <div className="relative text-center p-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
              {error}
            </h3>
            <button
              onClick={fetchDashboardData}
              className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 -m-8"></div>
          <div className="relative text-center p-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
              No data available
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

          <div className="relative p-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Your Learning Analytics
                </h1>
                <p className="text-gray-600 font-medium flex items-center space-x-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Track your progress and achievements</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card
            title="Courses Purchased"
            value={data.totalCoursesPurchased}
            icon="📚"
          />
          <Card
            title="Courses Completed"
            value={data.totalCoursesCompleted}
            icon="✅"
            emerald
          />
          <Card
            title="Courses Pending"
            value={data.totalCoursesNotCompleted}
            icon="⏳"
          />
          <Card
            title="Course Investment"
            value={`₹${data.totalCoursePurchaseCost.toLocaleString()}`}
            icon="💰"
            emerald
          />
          <Card title="Slots Booked" value={data.totalSlotBookings} icon="🎯" />
          <Card
            title="Slot Investment"
            value={`₹${data.totalSlotBookingCost.toLocaleString()}`}
            icon="💳"
            emerald
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Graph
            title="Monthly Course Purchases"
            data={formatChartData(data.coursePerformance)}
            color="#10b981"
            icon="📈"
          />
          <Graph
            title="Monthly Slot Bookings"
            data={formatChartData(data.slotPerformance)}
            color="#06b6d4"
            icon="📊"
          />
        </div>

        {/* Report Generation Section */}
        <div className="relative bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform translate-x-24 -translate-y-24"></div>

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Generate Reports
                  </h2>
                  <p className="text-gray-600 font-medium flex items-center space-x-2 mt-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter and analyze your activity</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm mb-8">
              <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>

              <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Report Type
                  </label>
                  <select
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium transition-all duration-300"
                    value={courseFilter.type}
                    onChange={handleFilterChange}
                  >
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="yearly">Yearly Report</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {courseFilter.type === "custom" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium transition-all duration-300"
                        value={customStartDate}
                        onChange={handleStartDateChange}
                        max={today}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm shadow-sm font-medium transition-all duration-300"
                        value={customEndDate}
                        onChange={handleEndDateChange}
                        min={customStartDate}
                        max={today}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-end">
                  <button
                    onClick={() => generateReports("both", 1)}
                    disabled={
                      reportLoading ||
                      (courseFilter.type === "custom" &&
                        (!customStartDate || !customEndDate))
                    }
                    className="group w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      {reportLoading ? (
                        <RefreshCw className="animate-spin h-4 w-4" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span>
                        {reportLoading ? "Generating..." : "Generate Reports"}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Report Status */}
            {!showReports && !reportLoading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Ready to Generate Reports
                </h3>
                <p className="text-gray-500">
                  Click "Generate Reports" to view detailed activity data
                </p>
              </div>
            )}

            {error && (
              <div className="relative bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <p className="font-semibold text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports Display */}
        {showReports && (
          <div className="relative bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-28 -translate-y-28"></div>

            <div className="relative p-8">
              {/* Report Header with Period */}
              <div className="relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-xl transform translate-x-12 -translate-y-12"></div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
                        Activity Report
                      </h3>
                      <p className="text-blue-600 font-semibold flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Period: {getFilterDisplayName()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 font-medium">
                      Generated on
                    </p>
                    <p className="font-bold text-blue-800">
                      {new Date().toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Tabs */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 p-2 rounded-2xl shadow-inner border border-gray-200">
                  <button
                    onClick={() => setActiveTab("course")}
                    className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === "course"
                        ? "bg-white text-emerald-600 shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-emerald-600 hover:bg-white/50"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Course Purchases ({courseReportData.length})</span>
                    </span>
                    {activeTab === "course" && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("slot")}
                    className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeTab === "slot"
                        ? "bg-white text-cyan-600 shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-cyan-600 hover:bg-white/50"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Slot Bookings ({slotReportData.length})</span>
                    </span>
                    {activeTab === "slot" && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                    )}
                  </button>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center space-x-3">
                  {activeTab === "course" && courseReportData.length > 0 && (
                    <>
                      <button
                        onClick={() =>
                          exportCourseReport(
                            "excel",
                            {
                              type: courseFilter.type,
                              startDate: courseFilter.startDate,
                              endDate: courseFilter.endDate,
                              page: courseFilter.page,
                            },
                            customStartDate,
                            customEndDate
                          )
                        }
                        disabled={
                          courseFilter.type === "custom" &&
                          (!customStartDate || !customEndDate)
                        }
                        className="group px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <span className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Excel</span>
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          exportCourseReport(
                            "pdf",
                            {
                              type: courseFilter.type,
                              startDate: courseFilter.startDate,
                              endDate: courseFilter.endDate,
                              page: courseFilter.page,
                            },
                            customStartDate,
                            customEndDate
                          )
                        }
                        disabled={
                          courseFilter.type === "custom" &&
                          (!customStartDate || !customEndDate)
                        }
                        className="group px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <span className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
                        </span>
                      </button>
                    </>
                  )}
                  {activeTab === "slot" && slotReportData.length > 0 && (
                    <>
                      <button
                        onClick={() =>
                          exportSlotReport(
                            "excel",
                            {
                              type: slotFilter.type,
                              startDate: slotFilter.startDate,
                              endDate: slotFilter.endDate,
                              page: slotFilter.page,
                            },
                            customStartDate,
                            customEndDate
                          )
                        }
                        disabled={
                          slotFilter.type === "custom" &&
                          (!customStartDate || !customEndDate)
                        }
                        className="group px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <span className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Excel</span>
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          exportSlotReport(
                            "pdf",
                            {
                              type: slotFilter.type,
                              startDate: slotFilter.startDate,
                              endDate: slotFilter.endDate,
                              page: slotFilter.page,
                            },
                            customStartDate,
                            customEndDate
                          )
                        }
                        disabled={
                          slotFilter.type === "custom" &&
                          (!customStartDate || !customEndDate)
                        }
                        className="group px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      >
                        <span className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Course Report */}
              {activeTab === "course" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      Course Purchase Report
                    </h3>
                  </div>

                  {courseReportData.length > 0 ? (
                    <div>
                      <div className="space-y-6 mb-8">
                        {courseReportData.map((item) => {
                          const courses = Array.isArray(item.courseName)
                            ? item.courseName
                            : [item.courseName || ""];
                          const prices = Array.isArray(item.price)
                            ? item.price
                            : [item.price || 0];

                          return (
                            <div
                              key={item.orderId}
                              className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              {/* Order Header */}
                              <div className="relative bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-4 border-b border-emerald-100 overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-xl transform translate-x-12 -translate-y-12"></div>

                                <div className="relative flex justify-between items-center">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                      <span className="text-white text-sm font-bold">
                                        #
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-semibold text-emerald-700">
                                        Order ID
                                      </span>
                                      <p className="text-lg font-bold text-emerald-800">
                                        {item.orderId}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-semibold text-emerald-700">
                                      Purchase Date
                                    </span>
                                    <p className="text-lg font-bold text-emerald-800">
                                      {new Date(item.date).toLocaleDateString(
                                        "en-GB"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Course Table */}
                              <div className="overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                    <tr>
                                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                        Course Name
                                      </th>
                                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                                        Price
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {courses.map((course, index) => (
                                      <tr
                                        key={`${item.orderId}-${index}`}
                                        className="border-b border-gray-50 last:border-b-0 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-cyan-50/30 transition-all duration-300"
                                      >
                                        <td className="px-6 py-4 text-sm text-gray-800 font-semibold">
                                          {course}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">
                                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 border border-emerald-200">
                                            ₹
                                            {(
                                              prices[index] || 0
                                            ).toLocaleString()}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Order Total */}
                              <div className="relative bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-4 border-t border-emerald-100 overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-200/20 to-cyan-200/20 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>

                                <div className="relative flex items-center justify-between">
                                  <span className="text-sm font-semibold text-emerald-700">
                                    Total Investment
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                      ₹{item.totalCost.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Controls for Course Report */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handlePageChange(courseFilter.page - 1)
                            }
                            disabled={courseFilter.page === 1 || reportLoading}
                            className="group px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 font-semibold hover:from-emerald-100 hover:to-cyan-100 hover:text-emerald-600 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none border border-gray-200 hover:border-emerald-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200">
                            <span className="text-sm font-bold text-emerald-700">
                              Page {courseFilter.page}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handlePageChange(courseFilter.page + 1)
                            }
                            disabled={
                              courseReportData.length < 5 || reportLoading
                            }
                            className="group px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 font-semibold hover:from-emerald-100 hover:to-cyan-100 hover:text-emerald-600 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none border border-gray-200 hover:border-emerald-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Course Report Totals */}
                      <div className="relative bg-gradient-to-r from-emerald-50 via-cyan-50 to-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/30 to-emerald-200/30 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-bold text-emerald-800">
                                Total Investment
                              </span>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                              ₹{courseReportTotals.totalCost.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-bold text-emerald-800">
                                Total Orders
                              </span>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                              {courseReportTotals.totalOrders}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Course Data Found
                      </h3>
                      <p className="text-gray-500">
                        No course purchase data found for the selected period
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Slot Report */}
              {activeTab === "slot" && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      Slot Booking Report
                    </h3>
                  </div>

                  {slotReportData.length > 0 ? (
                    <div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 shadow-lg mb-8">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-cyan-50 to-blue-50">
                              <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm">
                                  Booking ID
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm">
                                  Date
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm">
                                  Instructor
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm">
                                  Slot Time
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-gray-700 text-sm">
                                  Price
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {slotReportData.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-gray-50 last:border-b-0 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300"
                                >
                                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-700">
                                    {item.bookingId}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 font-medium">
                                    {new Date(item.date).toLocaleDateString(
                                      "en-GB"
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-gray-800">
                                    {item.instructorName}
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 font-medium">
                                    <div className="inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200">
                                      {`${formatTime(
                                        item.slotTime.startTime
                                      )} to ${formatTime(
                                        item.slotTime.endTime
                                      )}`}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 border border-emerald-200 font-bold">
                                      ₹{item.price.toLocaleString()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination Controls for Slot Report */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handlePageChange(slotFilter.page - 1)
                            }
                            disabled={slotFilter.page === 1 || reportLoading}
                            className="group px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 font-semibold hover:from-cyan-100 hover:to-blue-100 hover:text-cyan-600 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none border border-gray-200 hover:border-cyan-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                            <span className="text-sm font-bold text-cyan-700">
                              Page {slotFilter.page}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handlePageChange(slotFilter.page + 1)
                            }
                            disabled={
                              slotReportData.length < 5 || reportLoading
                            }
                            className="group px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 font-semibold hover:from-cyan-100 hover:to-blue-100 hover:text-cyan-600 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none border border-gray-200 hover:border-cyan-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Slot Report Totals */}
                      <div className="relative bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-cyan-200 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-100 shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-bold text-cyan-800">
                                Total Investment
                              </span>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                              ₹{slotReportTotals.totalCost.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-100 shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-bold text-cyan-800">
                                Total Bookings
                              </span>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                              {slotReportTotals.totalBookings}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                        <Clock className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Slot Data Found
                      </h3>
                      <p className="text-gray-500">
                        No slot booking data found for the selected period
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Enhanced Card Component
const Card = ({
  title,
  value,
  emerald = false,
  icon,
}: {
  title: string;
  value: any;
  emerald?: boolean;
  icon?: string;
}) => (
  <div className="group relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>

    <div className="relative flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span>{title}</span>
        </h3>
        <p
          className={`text-2xl font-bold transition-colors duration-300 ${
            emerald
              ? "bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent"
              : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
          <span className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            {icon}
          </span>
        </div>
      )}
    </div>
  </div>
);

// Enhanced Graph Component
const Graph = ({
  title,
  data,
  color,
  icon,
}: {
  title: string;
  data: any[];
  color: string;
  icon?: string;
}) => (
  <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/10 to-cyan-200/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

    <div className="relative">
      <div className="flex items-center space-x-3 mb-6">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 flex items-center justify-center border border-emerald-100 shadow-lg">
            <span className="text-lg">{icon}</span>
          </div>
        )}
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h3>
      </div>

      <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis allowDecimals={false} stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={(value: any, name: any) =>
                name === "totalAmount"
                  ? [`₹${value.toLocaleString()}`, "Amount"]
                  : [value, "Count"]
              }
              labelStyle={{ color: "#374151" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill={color}
              name="Count"
              radius={[6, 6, 0, 0]}
              className="drop-shadow-sm"
            />
            <Bar
              dataKey="totalAmount"
              fill="#d1d5db"
              name="Total Amount"
              radius={[6, 6, 0, 0]}
              className="drop-shadow-sm"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default StudentDashboard;
