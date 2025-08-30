import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSlotsOfParticularInstructor } from "../../../api/action/StudentAction";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { isStudentLoggedIn } from "../../../utils/auth"; // adjust the path as needed

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const StudentAvailableSlotsPage = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = isStudentLoggedIn();

  useEffect(() => {
    if (instructorId) {
      fetchSlots(instructorId);
    }
  }, [instructorId]);

  const fetchSlots = async (id: string) => {
    try {
      const res = await getSlotsOfParticularInstructor(id);
      setSlots(res.data || []);
    } catch (err) {
      toast.error("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDate = (slots: Slot[]) => {
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      const dateKey = format(new Date(slot.startTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <div className="relative bg-white shadow-xl border-b border-gray-100 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Available Time Slots ⏰
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              Choose your preferred time to book a session
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mt-4">
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span>Available</span>
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                <span>Booked</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 -m-4"></div>
          <div className="relative p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium text-lg">
                    Loading available slots...
                  </span>
                </div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No slots available
                </h3>
                <p className="text-gray-500 mb-6">
                  The instructor hasn't created any time slots yet
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
                >
                  <span className="flex items-center space-x-2">
                    <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                      ←
                    </span>
                    <span>Back to Instructor</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedSlots).map(([date, daySlots]) => (
                  <div key={date} className="relative">
                    {/* Day card background decoration */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 -m-2"></div>
                    <div className="relative p-6">
                      {/* Date Header */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent flex items-center space-x-3">
                          <span>📅</span>
                          <span>
                            {format(new Date(date), "eeee, MMMM d, yyyy")}
                          </span>
                        </h3>
                        <div className="mt-2 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-24"></div>
                      </div>

                      {/* Time Slots Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {daySlots.map((slot) => (
                          <button
                            key={slot._id}
                            className={`group relative px-4 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform border ${
                              slot.isBooked
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white/80 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 hover:scale-105 hover:shadow-emerald-200/50"
                            }`}
                            disabled={slot.isBooked}
                            onClick={() => {
                              if (!isLoggedIn) {
                                toast.info("Please login to book a slot.");
                                navigate("/user/login");
                              } else {
                                navigate(`/user/checkout/${slot._id}`);
                              }
                            }}
                          >
                            {/* Status indicator */}
                            <div
                              className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                                slot.isBooked ? "bg-gray-400" : "bg-emerald-500"
                              }`}
                            ></div>

                            <div className="text-center space-y-1">
                              <div className="text-lg font-bold">
                                {format(new Date(slot.startTime), "hh:mm a")}
                              </div>
                              <div className="text-sm opacity-75">to</div>
                              <div className="text-lg font-bold">
                                {format(new Date(slot.endTime), "hh:mm a")}
                              </div>
                            </div>

                            {!slot.isBooked && (
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-300"></div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Available slots count for the day */}
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          <span>✨</span>
                          <span>
                            {daySlots.filter((slot) => !slot.isBooked).length}{" "}
                            available slots
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Back Button */}
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => navigate(-1)}
                    className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
                  >
                    <span className="flex items-center space-x-3">
                      <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                        ←
                      </span>
                      <span>Back to Instructor Details</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAvailableSlotsPage;
