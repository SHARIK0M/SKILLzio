import { useEffect, useState } from "react";
import { slotHistory } from "../../../api/action/InstructorActionApi";
import EntityTable from "../../../components/common/EntityTable";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "react-toastify";

interface SlotStat {
  date: string;
  totalSlots: number;
  bookedSlots: number;
}

const SlotHistoryPage = () => {
  const currentDate = new Date();
  const [stats, setStats] = useState<SlotStat[]>([]);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"monthly" | "yearly" | "custom">("monthly");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSlotStats = async () => {
    try {
      if (
        (mode === "monthly" && (!month || !year)) ||
        (mode === "yearly" && !year) ||
        (mode === "custom" && (!startDate || !endDate))
      ) {
        setStats([]);
        return; // skip fetch if filters incomplete
      }

      setLoading(true);

      const params: Record<string, any> = {};
      if (mode === "monthly") {
        params.month = month;
        params.year = year;
      } else if (mode === "yearly") {
        params.year = year;
      } else if (mode === "custom") {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await slotHistory(mode, params);
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to fetch slot stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, month, year, startDate, endDate]);

  return (
    <div className="relative space-y-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Slot History
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Track your slot performance and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Filter Options
            </h3>
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
              Filter Mode
            </label>
            <div className="relative">
              <select
                className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm appearance-none cursor-pointer"
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
              >
                <option value="monthly">📅 Monthly</option>
                <option value="yearly">🗓️ Yearly</option>
                <option value="custom">📊 Custom Range</option>
              </select>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Filters */}
          {mode === "monthly" && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
                  Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                  placeholder="Enter month (1-12)"
                  value={month || ""}
                  onChange={(e) =>
                    setMonth(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
                  Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                  placeholder="Enter year"
                  value={year || ""}
                  onChange={(e) =>
                    setYear(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                />
              </div>
            </>
          )}

          {/* Yearly Filter */}
          {mode === "yearly" && (
            <div className="space-y-3 md:col-span-2">
              <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
                Year
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                placeholder="Enter year"
                value={year || ""}
                onChange={(e) =>
                  setYear(e.target.value === "" ? 0 : Number(e.target.value))
                }
              />
            </div>
          )}

          {/* Custom Date Filters */}
          {mode === "custom" && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-orange-300 uppercase tracking-wider">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700/50 border-2 border-gray-600/50 px-4 py-4 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-300 text-white hover:border-orange-500/50 hover:bg-gray-700/70 backdrop-blur-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Card */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30">
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <h3 className="text-lg font-bold text-orange-300 uppercase tracking-wider">
              Slot Statistics
            </h3>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-orange-300 font-semibold text-lg">
                  Loading slot stats...
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/30">
              <EntityTable
                title=""
                data={stats}
                emptyText="No slot activity found"
                columns={[
                  {
                    key: "date",
                    label: "Date",
                    render: (value: string) => {
                      const parsed = parseISO(value);
                      return isValid(parsed)
                        ? format(parsed, "dd-MM-yyyy")
                        : "Invalid date";
                    },
                  },
                  {
                    key: "totalSlots",
                    label: "Total Slots",
                  },
                  {
                    key: "bookedSlots",
                    label: "Booked Slots",
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotHistoryPage;
