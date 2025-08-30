import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookingDetail, slotReceipt } from "../../../api/action/StudentAction";
import { toast } from "react-toastify";
import fileDownload from "js-file-download";
import VideoCallModal from "../../../components/common/videocall/CreateCall"; // Import VideoCallModal
import useVideoCall from "../../../components/common/videocall/UseVideoCall"; // Import useVideoCall hook

interface User {
  username?: string;
  email?: string;
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface Booking {
  _id: string;
  amount?: number;
  status: string;
  createdAt: string;
  txnId?: string;
  gateway?: string;
  slotId?: Slot;
  instructorId?: User;
  studentId?: User;
}

export default function SlotBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSlotActive, setIsSlotActive] = useState(false);

  // Initialize useVideoCall hook
  const { showVideoCallModal, sender, handleCall, closeModal } = useVideoCall();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingDetail(bookingId!);
        setBooking(res.data);
        checkSlotActive(res.data.slotId?.startTime, res.data.slotId?.endTime);
      } catch (error) {
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  const checkSlotActive = (start?: string, end?: string) => {
    if (!start || !end) return;
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);
    setIsSlotActive(now >= startTime && now <= endTime);
  };

  const handleDownloadReceipt = async () => {
    if (!bookingId) return;
    try {
      const response = await slotReceipt(bookingId);
      fileDownload(response, `Slot-Receipt-${bookingId}.pdf`);
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  // Modified handleJoinCall to trigger video call modal
  const handleJoinCall = () => {
    if (!booking?.instructorId?.email) {
      toast.error("Instructor email not available");
      return;
    }
    console.log("Join Video Call Button Clicked - Student Side");
    console.log(booking.instructorId.email);
    handleCall(booking.instructorId.email); // Trigger video call with instructor's email
  };

  const formatDateTimeRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })} - ${endDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "paid":
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading booking details...
          </p>
        </div>
      </div>
    );

  if (!booking)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <p className="text-red-600 font-semibold text-lg">
            Booking not found
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Enhanced Header Card */}
        <div className="relative bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-white/20">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>

          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section with enhanced styling */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  📋 Booking Details
                </h1>
                <p className="text-gray-600 font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>
                    Booked on{" "}
                    {booking.createdAt ? formatDate(booking.createdAt) : "N/A"}
                  </span>
                </p>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-200"
                >
                  <span className="flex items-center space-x-2">
                    <span>📄</span>
                    <span>Download Receipt</span>
                  </span>
                </button>

                {booking.status === "confirmed" && isSlotActive && (
                  <button
                    onClick={handleJoinCall}
                    className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-emerald-200 animate-pulse"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📹</span>
                      <span>Join Video Call</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Student Card */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold">👨‍🎓</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Student</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold text-lg">
                  {booking.studentId?.username || "N/A"}
                </p>
                <p className="text-gray-600 text-sm">
                  {booking.studentId?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">👨‍🏫</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Instructor</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold text-lg">
                  {booking.instructorId?.username || "N/A"}
                </p>
                <p className="text-gray-600 text-sm">
                  {booking.instructorId?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-slate-500 flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Status</h3>
              </div>
              <div className="space-y-3">
                <span
                  className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
                <p className="text-gray-600 text-sm font-medium">
                  ID: {booking._id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Slot Information Card */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Decorative header background */}
          <div className="relative bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 p-8 border-b border-gray-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
            <div className="relative flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Slot Information
                </h3>
                <p className="text-gray-600 font-medium">
                  Session details and schedule
                </p>
              </div>
            </div>
          </div>

          <div className="relative p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Date Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500 text-lg">📅</span>
                  <p className="text-gray-500 font-semibold uppercase tracking-wide text-sm">
                    Date
                  </p>
                </div>
                <p className="text-gray-800 font-bold text-xl">
                  {booking.slotId?.startTime
                    ? new Date(booking.slotId.startTime).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>

              {/* Time Information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-500 text-lg">⏰</span>
                  <p className="text-gray-500 font-semibold uppercase tracking-wide text-sm">
                    Time
                  </p>
                </div>
                <p className="text-gray-800 font-bold text-xl">
                  {booking.slotId?.startTime && booking.slotId?.endTime
                    ? formatDateTimeRange(
                        booking.slotId.startTime,
                        booking.slotId.endTime
                      )
                    : "N/A"}
                </p>
              </div>

              {/* Transaction ID */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500 text-lg">🔗</span>
                  <p className="text-gray-500 font-semibold uppercase tracking-wide text-sm">
                    Transaction ID
                  </p>
                </div>
                <p className="text-gray-800 font-bold text-lg break-all">
                  {booking.txnId || "N/A"}
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-lg">💰</span>
                  <p className="text-gray-500 font-semibold uppercase tracking-wide text-sm">
                    Amount
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="teray-800 xt-gfont-bold text-3xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    ₹
                    {booking.slotId?.price !== undefined
                      ? booking.slotId.price.toLocaleString()
                      : "0"}
                  </p>
                  <span className="text-gray-500 text-sm font-medium">INR</span>
                </div>
              </div>
            </div>

            {/* Active Slot Indicator */}
            {isSlotActive && (
              <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-emerald-700 font-semibold">
                    🔴 Live Session - Join now!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCallModal && (
        <VideoCallModal
          to={sender}
          isOpen={showVideoCallModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
