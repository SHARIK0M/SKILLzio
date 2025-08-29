import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  orderDetail,
  downloadInvoice,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface Course {
  _id: string;
  courseName: string;
  thumbnailUrl: string;
  price: number;
}

interface User {
  username?: string;
  email?: string;
}

interface Order {
  _id: string;
  amount: number;
  createdAt: string;
  gateway: string;
  status: string;
  courses: Course[];
  userId?: User;
}

export default function StudentOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderDetail(orderId!);
        setOrder(res.order);
      } catch (error) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(orderId!);
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          <p className="text-gray-600 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          <p className="text-red-600 font-medium text-lg">Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="relative bg-white shadow-xl border-b border-gray-100 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Order placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <button
              onClick={handleDownloadInvoice}
              className="group px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium hover:from-emerald-50 hover:to-cyan-100 hover:text-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:border-emerald-200"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11v6m0 0l-3-3m3 3l3-3m6 3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Download Invoice
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Customer
              </h3>
              <p className="text-gray-700 font-medium">
                {order.userId?.username || "N/A"}
              </p>
              <p className="text-gray-600 text-sm">
                {order.userId?.email || "N/A"}
              </p>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Payment
              </h3>
              <p className="text-gray-700 font-medium capitalize">
                {order.gateway}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{order.amount.toLocaleString()}
              </p>
            </div>

            {/* Status Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Status
              </h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Order ID: {order._id}
              </p>
            </div>
          </div>

          {/* Courses List */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-700">
                Purchased Courses
              </h3>
            </div>

            {/* Table for desktop */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-emerald-50/80">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.courses.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-emerald-50/50 transition-all duration-300"
                    >
                      <td className="py-4 px-6 flex items-center gap-4">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.courseName}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {course.courseName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Digital Course
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-800">
                        ₹{course.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {order.courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 flex gap-4 items-center hover:bg-emerald-50/50 transition-all duration-300"
                >
                  <img
                    src={course.thumbnailUrl}
                    alt={course.courseName}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {course.courseName}
                    </h4>
                    <p className="text-sm text-gray-600">Digital Course</p>
                    <p className="text-lg font-semibold text-gray-800">
                      ₹{course.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="bg-emerald-50/80 p-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-gray-800">
                ₹{order.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
