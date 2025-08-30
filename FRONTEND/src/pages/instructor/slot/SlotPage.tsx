import { useEffect, useState } from "react";
import { listSlots, deleteSlot } from "../../../api/action/InstructorActionApi";
import { format, isSameDay, parseISO, startOfWeek, addDays } from "date-fns";
import { toast } from "react-toastify";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import SlotModal from "../../../components/instructorComponent/SlotModal";
import { useNavigate } from "react-router-dom";

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

const daysToRender = 7;

const SlotPage = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const navigate = useNavigate();

  const fetchSlots = async () => {
    try {
      const { slots } = await listSlots();
      setSlots(slots);
    } catch (err) {
      toast.error("Failed to fetch slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteSlot(slotId);
      toast.success("Slot deleted");
      fetchSlots();
    } catch (err) {
      toast.error("Failed to delete slot");
    }
  };

  const getSlotsForDate = (date: Date) => {
    return slots.filter((slot) => isSameDay(parseISO(slot.startTime), date));
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingSlot(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: Slot) => {
    setModalMode("edit");
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const goToPreviousWeek = () => {
    const newStart = addDays(weekStartDate, -7);
    setWeekStartDate(newStart);
    setSelectedDate(newStart);
  };

  const goToNextWeek = () => {
    const newStart = addDays(weekStartDate, 7);
    setWeekStartDate(newStart);
    setSelectedDate(newStart);
  };

  const weekEndDate = addDays(weekStartDate, 6);

  return (
    <div className="relative">
      {/* Background elements matching instructor layout */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Select Time Slot
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your teaching schedule efficiently
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/instructor/slotsHistory")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
            >
              <span className="text-lg">🧾</span>
              See Slot History
            </button>
          </div>
        </div>

        {/* Week Navigation Card */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
          <div className="flex justify-between items-center">
            <button
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 font-semibold transition-all duration-300 hover:scale-105"
              onClick={goToPreviousWeek}
            >
              <span className="text-lg">←</span>
              <span>Previous Week</span>
            </button>

            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {format(weekStartDate, "MMM d")} -{" "}
                {format(weekEndDate, "MMM d")}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {format(weekStartDate, "yyyy")}
              </div>
            </div>

            <button
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 font-semibold transition-all duration-300 hover:scale-105"
              onClick={goToNextWeek}
            >
              <span>Next Week</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Day Selector Card */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Select Day
            </h3>
            <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {[...Array(daysToRender)].map((_, index) => {
              const day = addDays(weekStartDate, index);
              const isSelected = isSameDay(selectedDate, day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`relative group flex flex-col justify-center items-center p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/10 hover:text-white border border-gray-600/30 hover:border-orange-500/30"
                  }`}
                >
                  {/* Glow effect for active day */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-orange-600/20 blur-xl"></div>
                  )}

                  <div className="relative z-10">
                    <span className="text-2xl font-bold block">
                      {format(day, "d")}
                    </span>
                    <span className="text-xs uppercase tracking-wider mt-1">
                      {format(day, "EEE")}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date & Slots Card */}
        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {format(selectedDate, "EEEE, MMM d")}
                </h3>
                <p className="text-orange-300/80 text-sm">
                  Available time slots
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
            >
              <PlusCircle className="w-5 h-5" />
              Add Slots
            </button>
          </div>

          {/* Time slots display */}
          <div className="min-h-[120px]">
            {getSlotsForDate(selectedDate).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getSlotsForDate(selectedDate).map((slot) => (
                  <div
                    key={slot._id}
                    onClick={() =>
                      slot.isBooked
                        ? navigate(`/instructor/slots/${slot._id}`)
                        : undefined
                    }
                    className={`relative group p-4 rounded-2xl border transition-all duration-300 transform hover:scale-105 ${
                      slot.isBooked
                        ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30 text-red-300 cursor-pointer hover:shadow-lg hover:shadow-red-500/25"
                        : "bg-gradient-to-r from-gray-700/50 to-gray-600/50 border-gray-600/30 text-white hover:border-orange-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          {format(parseISO(slot.startTime), "h:mm a")} -{" "}
                          {format(parseISO(slot.endTime), "h:mm a")}
                        </div>
                        <div className="text-sm opacity-80 mt-1">
                          ₹{slot.price}
                        </div>
                        {slot.isBooked && (
                          <div className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-lg mt-2 inline-block">
                            BOOKED
                          </div>
                        )}
                      </div>

                      {!slot.isBooked && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(slot);
                            }}
                            className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300 transition-all duration-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlot(slot._id);
                            }}
                            className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl text-gray-500">📅</span>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  No Slots Allotted
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Click "Add Slots" to create your first time slot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot Modal */}
      <SlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        selectedDate={selectedDate}
        onSuccess={() => {
          fetchSlots();
          setIsModalOpen(false);
        }}
        initialData={editingSlot}
      />
    </div>
  );
};

export default SlotPage;
