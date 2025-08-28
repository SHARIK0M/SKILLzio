import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  BookOpen,
  DollarSign,
  Award,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getDashboard,
  getRevenueDashboard,
  exportRevenueReport,
} from "../../api/action/InstructorActionApi";
import { type IDashboardData } from "../../types/interface/IdashboardTypes";

// Utility function to format date as DD-MM-YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportRange, setReportRange] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "custom"
  >("daily");
  const [reportData, setReportData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(5); // Matches backend default limit
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const fetchReport = async (page: number = 1) => {
    if (
      reportRange === "custom" &&
      (!startDate || !endDate || new Date(startDate) > new Date(endDate))
    ) {
      alert(
        "Please provide a valid date range. Start date must be before or equal to end date."
      );
      return;
    }

    try {
      setReportLoading(true);
      const response = await getRevenueDashboard(
        reportRange,
        page,
        limit,
        startDate,
        endDate
      );
      setReportData(response?.data || []);
      setTotalRecords(response?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setError("Failed to fetch revenue report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboard();
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalRecords / limit)) return;
    fetchReport(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-orange-300 text-lg font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-400 mb-6">
            <BookOpen size={64} className="mx-auto" />
          </div>
          <p className="text-gray-300 text-lg mb-4">
            {error || "No Data Found"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-orange-500/25 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    topCourses,
    categorySales,
    monthlySales,
    totalRevenue,
    totalCourseSales,
  } = dashboardData;

  const monthlyData = monthlySales.map((item) => ({
    month: `${item.month}/${item.year}`,
    sales: item.totalSales,
    revenue: item.totalRevenue,
  }));

  const categoryData = categorySales.map((item) => ({
    name: item.categoryName,
    value: item.totalSales,
    percentage: Math.round((item.totalSales / totalCourseSales) * 100),
  }));

  const totalCategories = categorySales.length;

  const COLORS = [
    "#FB923C",
    "#F97316",
    "#EA580C",
    "#DC2626",
    "#C2410C",
    "#B45309",
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-3xl"></div>
        <div className="relative p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 mt-1">
                Track your teaching performance and earnings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ₹{totalRevenue.toLocaleString()}
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
                Total Course Sales
              </p>
              <p className="text-2xl font-bold text-white">
                {totalCourseSales}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Active Courses
              </p>
              <p className="text-2xl font-bold text-white">
                {topCourses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Categories
              </p>
              <p className="text-2xl font-bold text-white">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        </div>
      </div>

      {/* Revenue Report Generator */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">📈</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Revenue Report Generator
          </h3>
        </div>

        <div className="flex flex-wrap gap-4 items-end mb-6">
          <select
            value={reportRange}
            onChange={(e) => {
              setReportRange(e.target.value as any);
              setCurrentPage(1); // Reset to page 1 on range change
            }}
            className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>

          {reportRange === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </>
          )}

          <button
            onClick={() => fetchReport(1)}
            disabled={
              reportLoading ||
              (reportRange === "custom" &&
                (!startDate ||
                  !endDate ||
                  new Date(startDate) > new Date(endDate)))
            }
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              reportLoading ||
              (reportRange === "custom" &&
                (!startDate ||
                  !endDate ||
                  new Date(startDate) > new Date(endDate)))
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-orange-500/25"
            }`}
          >
            {reportLoading ? "Loading..." : "Create Report"}
          </button>
        </div>

        {reportData.length > 0 ? (
          <div className="space-y-6">
            {/* Export Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() =>
                  exportRevenueReport(reportRange, "excel", startDate, endDate)
                }
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                📊 Export Excel
              </button>
              <button
                onClick={() =>
                  exportRevenueReport(reportRange, "pdf", startDate, endDate)
                }
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
              >
                📄 Export PDF
              </button>
            </div>

            {/* Report Table */}
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
                      Courses
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
                  {Object.entries(
                    reportData.reduce<
                      Record<
                        string,
                        {
                          date: string;
                          courses: string[];
                          totalPrice: number;
                          totalInstructorEarning: number;
                        }
                      >
                    >((acc, curr) => {
                      const orderId = curr.orderId.toString();
                      if (!acc[orderId]) {
                        acc[orderId] = {
                          date: curr.createdAt,
                          courses: [],
                          totalPrice: 0,
                          totalInstructorEarning: 0,
                        };
                      }
                      acc[orderId].courses.push(curr.courseName);
                      acc[orderId].totalPrice += curr.coursePrice;
                      acc[orderId].totalInstructorEarning +=
                        curr.instructorEarning;
                      return acc;
                    }, {})
                  ).map(([orderId, data], idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-300"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        #{orderId}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(data.date)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {data.courses.join(", ")}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ₹{data.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-green-400 font-semibold">
                        ₹{data.totalInstructorEarning.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-t border-gray-600/30">
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right text-orange-300 font-bold"
                    >
                      Total Instructor Revenue
                    </td>
                    <td className="px-6 py-4 text-green-400 font-bold text-lg">
                      ₹
                      {(
                        Object.values(
                          reportData.reduce((acc, curr) => {
                            const orderId = curr.orderId.toString();
                            acc[orderId] = acc[orderId] || 0;
                            acc[orderId] += curr.instructorEarning;
                            return acc;
                          }, {} as Record<string, number>)
                        ) as number[]
                      )
                        .reduce((sum, val) => sum + val, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
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
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-400">
              {reportLoading
                ? "Loading report..."
                : "No data available. Please generate a report."}
            </p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Monthly Performance
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.9)",
                  border: "1px solid rgba(75, 85, 99, 0.3)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value: number, name: string) => [
                  name === "sales" ? value : `₹${value}`,
                  name === "sales" ? "Sales" : "Revenue",
                ]}
              />
              <Bar dataKey="sales" fill="#FB923C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Category Distribution
            </h3>
          </div>
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.9)",
                      border: "1px solid rgba(75, 85, 99, 0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`${value} sales`, "Sales"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 mt-6 lg:mt-0 lg:ml-6 space-y-4">
              {categoryData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                    <span className="text-sm font-medium text-white">
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">
                      {entry.value}
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Courses */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Top Selling Courses
          </h3>
        </div>
        <div className="space-y-4">
          {topCourses.length > 0 ? (
            topCourses.map((course, index) => (
              <div
                key={course._id}
                className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 border border-gray-600/30 transform hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.courseName}
                    className="w-16 h-16 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                      const fallback =
                        target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl hidden items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm leading-5 mb-1">
                    {course.courseName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-orange-300 font-medium">
                      {course.count} sales
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <span className="text-sm font-bold text-white">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-orange-400" />
              </div>
              <p className="text-gray-400">No courses found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
