import { Dialog } from "@headlessui/react";
import { format, parseISO, isBefore } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createSlot, updateSlot } from "../../api/action/InstructorActionApi";

export interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  isBooked: boolean;
}

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  selectedDate: Date;
  onSuccess: () => void;
  initialData?: Slot | null;
}

const SlotModal = ({
  isOpen,
  onClose,
  mode,
  selectedDate,
  onSuccess,
  initialData,
}: SlotModalProps) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setStartTime(format(parseISO(initialData.startTime), "HH:mm"));
      setEndTime(format(parseISO(initialData.endTime), "HH:mm"));
      setPrice(initialData.price);
    } else {
      setStartTime("");
      setEndTime("");
      setPrice("");
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    if (!startTime || !endTime || price === "") {
      toast.error("All fields are required");
      return;
    }

    if (typeof price === "number" && price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const dateString =
      mode === "edit" && initialData
        ? format(parseISO(initialData.startTime), "yyyy-MM-dd")
        : format(selectedDate, "yyyy-MM-dd");

    const startDateTime = new Date(`${dateString}T${startTime}`);
    const endDateTime = new Date(`${dateString}T${endTime}`);
    const now = new Date();

    if (isBefore(startDateTime, now)) {
      toast.error("Cannot select a start time in the past");
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      if (mode === "add") {
        await createSlot({
          startTime: startDateTime,
          endTime: endDateTime,
          price: Number(price),
        });
        toast.success("Slot created");
      } else if (mode === "edit" && initialData) {
        await updateSlot(initialData._id, {
          startTime: startDateTime,
          endTime: endDateTime,
          price: Number(price),
        });
        toast.success("Slot updated");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Enhanced backdrop with glassmorphism */}
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl transition-opacity"
        aria-hidden="true"
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl border border-gray-700/30 transition-all">
          {/* Decorative top bar */}
          <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

          {/* Header with instructor layout styling */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 px-6 py-6 border-b border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">{mode === "add" ? "✨" : "✏️"}</span>
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {mode === "add" ? "Create New Slot" : "Edit Slot"}
                </Dialog.Title>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === "add"
                    ? "Add a new time slot for bookings"
                    : "Update your existing slot"}
                </p>
              </div>
            </div>
          </div>

          {/* Content area with instructor styling */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Start Time */}
              <div className="group">
                <label className="block text-sm font-bold text-orange-300 mb-3 uppercase tracking-wider">
                  🕐 Start Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div className="group">
                <label className="block text-sm font-bold text-orange-300 mb-3 uppercase tracking-wider">
                  🕐 End Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="group">
                <label className="block text-sm font-bold text-orange-300 mb-3 uppercase tracking-wider">
                  💰 Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    placeholder="Enter price..."
                    className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm pl-12"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid numbers
                      if (value === "") {
                        setPrice("");
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setPrice(numValue);
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-orange-400 font-bold text-lg">₹</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions with instructor styling */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700/30">
              <button
                onClick={onClose}
                className="px-6 py-4 rounded-2xl bg-gray-700/50 border-2 border-gray-600/50 text-gray-300 hover:bg-gray-600/50 hover:border-gray-500/50 hover:text-white font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 font-bold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 tracking-wide"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    SAVING...
                  </>
                ) : (
                  <>
                    <span className="text-xl">
                      {mode === "add" ? "➕" : "✅"}
                    </span>
                    {mode === "add" ? "CREATE SLOT" : "UPDATE SLOT"}
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SlotModal;
