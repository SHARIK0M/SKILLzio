import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  specificCourseDashboard,
  specificCourseReport,
  exportSpecificCourseReport,
} from "../../../api/action/InstructorActionApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  Users,
  Tag,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface MonthlyData {
  month: number;
  year: number;
  totalSales: number;
}

interface ReportItem {
  orderId: string;
  courseName: string;
  purchaseDate: string;
  coursePrice: number;
  instructorRevenue: number;
  totalEnrollments: number;
}

const monthMap = [
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

const SpecificDashboardPage = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<null | {
    fullPrice: number;
    revenue: number;
    enrollments: number;
    category: string | null;
    monthlyPerformance: MonthlyData[];
  }>(null);

  const [filter, setFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "custom"
  >("yearly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(5); // Default items per page

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const response = await specificCourseDashboard(courseId);
        setDashboard(response.data);
      } catch (err) {
        toast.error("Failed to load course dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleGenerateReport = async (page: number = 1) => {
    try {
      if (!courseId) return;

      if (filter === "custom") {
        if (!startDate || !endDate) {
          toast.error("Please select both start and end dates.");
          return;
        }

        // Validate dates
        const today = new Date().toISOString().split("T")[0];

        if (startDate > today) {
          toast.error("Start date cannot be in the future.");
          return;
        }

        if (endDate > today) {
          toast.error("End date cannot be in the future.");
          return;
        }

        if (startDate > endDate) {
          toast.error("Start date cannot be later than end date.");
          return;
        }
      }

      setReportLoading(true);
      const response = await specificCourseReport(
        courseId,
        filter,
        startDate,
        endDate,
        page,
        limit
      );

      // Detailed logging for debugging
      console.log("Raw Response:", JSON.stringify(response, null, 2));
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      // Check response structure
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      let reportItems: ReportItem[];
      let total: number;

      // Handle both possible response structures
      if (Array.isArray(response.data)) {
        // Backward compatibility: response.data is ReportItem[]
        reportItems = response.data;
        total = reportItems.length;
      } else {
        // Expected structure: { success: boolean, data: ReportItem[], total: number }
        const { success, data, total: responseTotal, message } = response.data;
        if (!success) {
          throw new Error(message || "Server returned an error");
        }
        if (!Array.isArray(data)) {
          throw new Error("Report data is not an array");
        }
        reportItems = data;
        total = responseTotal || data.length;
      }

      setReportData(reportItems);
      setTotalRecords(total);
      setCurrentPage(page);

      // Calculate total revenue from the report data
      const calculatedTotalRevenue = reportItems.reduce(
        (sum: number, item: ReportItem) => sum + item.instructorRevenue,
        0
      );
      setTotalRevenue(calculatedTotalRevenue);

      if (reportItems.length === 0) {
        toast.info("No data found for the selected period.");
      } else {
        toast.success(`Report generated with ${reportItems.length} records.`);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report"
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportReport = async (format: "pdf" | "excel") => {
    try {
      if (!courseId) return;

      if (reportData.length === 0) {
        toast.error("Please generate a report before exporting.");
        return;
      }

      setExportLoading((prev) => ({ ...prev, [format]: true }));
      await exportSpecificCourseReport(
        courseId,
        filter,
        startDate,
        endDate,
        format
      );
      toast.success(`Report exported successfully as ${format.toUpperCase()}.`);
    } catch (error) {
      console.error(`Failed to export ${format} report:`, error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalRecords / limit)) return;
    handleGenerateReport(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-orange-300 text-lg font-medium">
            Loading Course Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-400 mb-6">
            <BookOpen size={64} className="mx-auto" />
          </div>
          <p className="text-gray-300 text-lg">No data found</p>
        </div>
      </div>
    );
  }

  const { fullPrice, revenue, enrollments, category, monthlyPerformance } =
    dashboard;

  const formattedData = monthlyPerformance.map((item) => ({
    name: `${monthMap[item.month - 1]} ${item.year}`,
    revenue: item.totalSales,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-3xl"></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Course Analytics
              </h1>
              <p className="text-gray-400 mt-1">
                Detailed performance metrics for this course
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Course Price
              </p>
              <p className="text-2xl font-bold text-white">
                ₹{fullPrice.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Instructor Revenue
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ₹{revenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Total Enrollments
              </p>
              <p className="text-2xl font-bold text-white">{enrollments}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Category</p>
              <p className="text-xl font-semibold text-white">
                {category || "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">📈</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Monthly Instructor Revenue
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis tickFormatter={(v) => `₹${v}`} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.9)",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Report Section */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Generate Revenue Report
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setCurrentPage(1); // Reset to page 1 on filter change
            }}
            className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            disabled={reportLoading}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>

          {filter === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={getTodayDate()}
                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                disabled={reportLoading}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                max={getTodayDate()}
                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                disabled={reportLoading}
              />
            </>
          )}

          <button
            onClick={() => handleGenerateReport(1)}
            disabled={reportLoading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 ${
              reportLoading
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-orange-500/25"
            }`}
          >
            {reportLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            {reportLoading ? "Generating..." : "Create Report"}
          </button>

          {reportData.length > 0 && (
            <>
              <button
                onClick={() => handleExportReport("pdf")}
                disabled={exportLoading.pdf || reportLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 ${
                  exportLoading.pdf || reportLoading
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/25"
                }`}
              >
                {exportLoading.pdf && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                📄 {exportLoading.pdf ? "Exporting..." : "Export PDF"}
              </button>
              <button
                onClick={() => handleExportReport("excel")}
                disabled={exportLoading.excel || reportLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 ${
                  exportLoading.excel || reportLoading
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white hover:shadow-teal-500/25"
                }`}
              >
                {exportLoading.excel && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                📊 {exportLoading.excel ? "Exporting..." : "Export Excel"}
              </button>
            </>
          )}
        </div>

        {reportData.length > 0 && (
          <div className="space-y-6">
            <div className="overflow-x-auto bg-gray-700/30 rounded-2xl border border-gray-600/30 backdrop-blur-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-gray-600/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-orange-300 font-semibold">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-orange-300 font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-orange-300 font-semibold">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-orange-300 font-semibold">
                      Total Price
                    </th>
                    <th className="px-6 py-4 text-left text-orange-300 font-semibold">
                      Instructor Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item) => (
                    <tr
                      key={item.orderId}
                      className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-300"
                    >
                      <td className="px-6 py-4 text-blue-400 font-medium">
                        #{item.orderId}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {format(new Date(item.purchaseDate), "dd-MM-yyyy")}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {item.courseName}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ₹{item.coursePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-green-400 font-semibold">
                        ₹{item.instructorRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-t border-gray-600/30">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right text-orange-300 font-bold"
                    >
                      Total Instructor Revenue
                    </td>
                    <td className="px-6 py-4 text-green-400 font-bold text-lg">
                      ₹{totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-t border-gray-600/30">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right text-orange-300 font-bold"
                    >
                      Total Enrollments
                    </td>
                    <td className="px-6 py-4 text-green-400 font-bold text-lg">
                      {dashboard?.enrollments || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || reportLoading}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 transition-all duration-300 border border-gray-600/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-300 bg-gray-700/30 px-4 py-2 rounded-xl border border-gray-600/30">
                  Page {currentPage} of {Math.ceil(totalRecords / limit)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil(totalRecords / limit) ||
                    reportLoading
                  }
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:text-gray-500 transition-all duration-300 border border-gray-600/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {reportData.length === 0 && !reportLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-400">
              No report data available. Click "Create Report" to generate a
              report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecificDashboardPage;
