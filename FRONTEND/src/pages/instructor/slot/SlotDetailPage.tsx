import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { slotDetailsInInstructor } from "../../../api/action/InstructorActionApi";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import VideoCallModal from "../../../components/common/videocall/CreateCall"; // Import VideoCallModal
import useVideoCall from "../../../components/common/videocall/UseVideoCall"; // Import useVideoCall hook

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

interface User {
  username: string;
  email: string;
}

interface BookingDetail {
  _id: string;
  slotId: Slot;
  studentId?: User;
  instructorId: User;
  createdAt: string;
  updatedAt: string;
}

const SlotDetailPage = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize useVideoCall hook
  const { showVideoCallModal, sender, handleCall, closeModal } = useVideoCall();

  const fetchSlotDetail = async () => {
    try {
      const { booking } = await slotDetailsInInstructor(slotId!);
      setBookingDetail(booking);
    } catch (err) {
      toast.error("Failed to load slot detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotDetail();
  }, [slotId]);

  // Handle navigation after call ends
  const handleCloseModal = () => {
    closeModal();
    navigate(`/instructor/slots/${slotId}`); // Navigate to desired route after call ends
  };

  const handleJoinCall = () => {
    if (!bookingDetail?.studentId?.email) {
      toast.error("Student email not available");
      return;
    }
    console.log("Join Video Call Button Clicked - Instructor Side");
    handleCall(bookingDetail.studentId.email); // Trigger video call with student's email
  };

  if (loading) {
    return (
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-orange-300 font-semibold text-lg">
                Loading slot details...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetail) {
    return (
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-400 text-lg font-semibold">
              No slot found or you are not authorized to view this.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    slotId: slot,
    studentId,
    instructorId,
    createdAt,
    updatedAt,
  } = bookingDetail;
  const currentTime = new Date();

  return (
    <div className="relative space-y-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-700/50 hover:bg-orange-500/20 text-gray-300 hover:text-orange-300 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-gray-600/30 hover:border-orange-500/30"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Slot Detail
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Comprehensive slot information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Information Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">⏰</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Slot Information
            </h3>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                Start Time
              </span>
              <span className="text-white font-bold text-lg">
                {format(parseISO(slot.startTime), "dd MMM yyyy, h:mm a")}
              </span>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                End Time
              </span>
              <span className="text-white font-bold text-lg">
                {format(parseISO(slot.endTime), "dd MMM yyyy, h:mm a")}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                Price
              </span>
              <span className="text-white font-bold text-lg">
                ₹{slot.price}
              </span>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                Booking Status
              </span>
              {slot.isBooked ? (
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                  ✅ Booked
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  ⏳ Not Booked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">👨‍🎓</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Student Information
            </h3>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
        </div>

        {studentId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                Student Name
              </span>
              <span className="text-white font-bold text-lg">
                {studentId.username}
              </span>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
              <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
                Email Address
              </span>
              <span className="text-white font-bold text-lg">
                {studentId.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-gray-500">📭</span>
            </div>
            <p className="text-gray-400 text-lg font-medium">
              Not booked by any student
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This slot is still available for booking
            </p>
          </div>
        )}
      </div>

      {/* Instructor Information Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">👨‍🏫</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Instructor Information
            </h3>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
            <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
              Instructor Name
            </span>
            <span className="text-white font-bold text-lg">
              {instructorId.username}
            </span>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
            <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
              Email Address
            </span>
            <span className="text-white font-bold text-lg">
              {instructorId.email}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Timeline Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Booking Timeline
            </h3>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
            <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
              Booking Created
            </span>
            <span className="text-white font-bold text-lg">
              {format(parseISO(createdAt), "dd MMM yyyy, h:mm a")}
            </span>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-2xl border border-gray-600/30">
            <span className="text-orange-300 font-semibold text-sm uppercase tracking-wider block mb-2">
              Last Updated
            </span>
            <span className="text-white font-bold text-lg">
              {format(parseISO(updatedAt), "dd MMM yyyy, h:mm a")}
            </span>
          </div>
        </div>
      </div>

      {/* Video Call Action Card */}
      {slot.isBooked &&
        currentTime >= new Date(slot.startTime) &&
        currentTime <= new Date(slot.endTime) && (
          <div className="relative z-10 bg-gradient-to-r from-orange-500/10 to-orange-600/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📹</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Session Active
                  </h3>
                  <p className="text-orange-300/80 text-sm mt-1">
                    Your class is live and ready to join
                  </p>
                </div>
              </div>

              <button
                onClick={handleJoinCall}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 tracking-wide"
              >
                <span className="text-xl">🎥</span>
                JOIN CALL
              </button>
            </div>
          </div>
        )}

      {/* Video Call Modal */}
      {showVideoCallModal && (
        <VideoCallModal
          to={sender}
          isOpen={showVideoCallModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SlotDetailPage;
