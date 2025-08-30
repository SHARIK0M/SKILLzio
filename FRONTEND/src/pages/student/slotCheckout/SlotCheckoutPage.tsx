import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  slotCheckout,
  verifySlotPayment,
  getWallet,
  bookSlotViaWallet,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";
import { format } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SlotCheckoutPage = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null); // booking contains slotId and instructorId
  const [order, setOrder] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slotId) return;

    const init = async () => {
      try {
        const walletRes = await getWallet();
        setWalletBalance(walletRes.wallet?.balance || 0);

        const res = await slotCheckout(slotId); // Get the full response
        const { booking, razorpayOrder } = res;

        if (!booking || !razorpayOrder) {
          console.warn("Missing booking or razorpayOrder", {
            booking,
            razorpayOrder,
          });
          toast.error("Failed to load booking details.");
          navigate("/user/slotsHistory");
          return;
        }

        setBooking(booking);
        setOrder(razorpayOrder);
      } catch (err: any) {
        console.error(
          "❌ Checkout initiation error:",
          err.response?.data || err.message
        );
        toast.error(
          err.response?.data?.message || "Failed to initiate booking"
        );
        navigate("/user/slotsHistory");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [slotId]);

  const handleRazorpayPayment = () => {
    if (!order || !booking) return toast.error("Booking not ready");

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
      amount: order.amount,
      currency: order.currency,
      name: "SKILZIO Slot Booking",
      description: "Session with Instructor",
      order_id: order.id,
      handler: async function (response: any) {
        try {
          await verifySlotPayment(slotId!, response.razorpay_payment_id);
          toast.success("✅ Slot booked successfully!");
          navigate("/user/slotsHistory");
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || "❌ Payment verification failed"
          );
        }
      },
      prefill: {
        name: "",
        email: "",
      },
      theme: {
        color: "#1A73E8",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleWalletPayment = async () => {
    const slotPrice = booking?.slotId?.price || 0;

    if (walletBalance < slotPrice) {
      toast.error(
        "❌ Insufficient wallet balance. Please use Razorpay or recharge your wallet."
      );
      return;
    }

    try {
      await bookSlotViaWallet(slotId!);
      toast.success("✅ Slot booked using wallet!");
      navigate("/user/slotsHistory");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "❌ Wallet booking failed");
    }
  };

  const slot = booking?.slotId || {};
  const instructor = booking?.instructorId || {};
  const slotPrice = slot?.price || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium text-lg">
              Loading booking details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <div className="relative bg-white shadow-xl border-b border-gray-100 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative max-w-4xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Confirm Your Booking 💳
            </h2>
            <p className="text-gray-600 font-medium text-lg">
              Review your slot details and complete your payment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 -m-4"></div>
          <div className="relative p-8">
            {booking && slot ? (
              <div className="space-y-8">
                {/* Booking Details Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 -m-2"></div>
                  <div className="relative p-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                      <span>📋</span>
                      <span>Booking Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📅</span>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              Date
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                              {format(new Date(slot.startTime), "dd-MM-yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">⏰</span>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              Time
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                              {`${format(
                                new Date(slot.startTime),
                                "h:mm a"
                              )} - ${format(new Date(slot.endTime), "h:mm a")}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">👨‍🏫</span>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              Instructor
                            </p>
                            <p className="text-lg font-bold text-gray-800">
                              {instructor.username || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">💰</span>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">
                              Session Price
                            </p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                              ₹{slotPrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 -m-2"></div>
                  <div className="relative p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
                      <span>💳</span>
                      <span>Your Wallet Balance</span>
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            walletBalance >= slotPrice
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-2xl font-bold text-gray-800">
                          ₹{walletBalance}
                        </span>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          walletBalance >= slotPrice
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {walletBalance >= slotPrice
                          ? "✅ Sufficient Balance"
                          : "⚠️ Insufficient Balance"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                    Choose Your Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Wallet Payment Button */}
                    <button
                      onClick={handleWalletPayment}
                      disabled={walletBalance < slotPrice}
                      className={`group relative px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl transform border-2 ${
                        walletBalance >= slotPrice
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 border-green-200 shadow-green-200/50"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      <span className="flex flex-col items-center space-y-2">
                        <span className="text-2xl">💳</span>
                        <span>Pay via Wallet</span>
                        <span className="text-sm opacity-90">₹{slotPrice}</span>
                      </span>
                      {walletBalance >= slotPrice && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 rounded-2xl transition-all duration-300"></div>
                      )}
                    </button>

                    {/* Razorpay Payment Button */}
                    <button
                      onClick={handleRazorpayPayment}
                      className="group relative px-8 py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-blue-200"
                    >
                      <span className="flex flex-col items-center space-y-2">
                        <span className="text-2xl">💎</span>
                        <span>Pay via Razorpay</span>
                        <span className="text-sm opacity-90">₹{slotPrice}</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 rounded-2xl transition-all duration-300"></div>
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm">
                    🔒 Your payment is secure and encrypted
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center">
                  <span className="text-4xl">❌</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Booking information not available
                </h3>
                <p className="text-gray-500 mb-6">
                  Unable to load the booking details
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200"
                >
                  <span className="flex items-center space-x-2">
                    <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
                      ←
                    </span>
                    <span>Go Back</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotCheckoutPage;
