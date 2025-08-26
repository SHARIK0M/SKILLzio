import { useEffect, useState } from "react";
import {
  getCart,
  initiateCheckout,
  checkoutCompleted,
  removeFromCart,
  getWallet,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

interface Course {
  _id: string;
  courseName: string;
  price: number;
  thumbnailUrl: string;
}

interface Wallet {
  balance: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "wallet">(
    "razorpay"
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartCourses();
    fetchWalletBalance();
  }, []);

  const fetchCartCourses = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      setCourses(response?.data?.courses || []);
    } catch {
      toast.error("Failed to load cart for checkout.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await getWallet();
      setWallet(res?.wallet || { balance: 0 });
    } catch {
      toast.error("Failed to fetch wallet balance.");
    }
  };

  const totalAmount = courses.reduce((sum, c) => sum + c.price, 0);

  const handlePayment = async () => {
    try {
      if (courses.length === 0) {
        toast.warn("No courses to checkout.");
        return;
      }

      const courseIds = courses.map((c) => c._id);
      const response = await initiateCheckout(
        courseIds,
        totalAmount,
        paymentMethod
      );
      const order = response?.order;

      if (paymentMethod === "wallet") {
        toast.success("Payment successful via wallet! You've been enrolled.");
        navigate("/user/enrolled");
        return;
      }

      if (!order || !order.gatewayOrderId) {
        toast.error("Failed to initiate order with Razorpay.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount * 100,
        currency: "INR",
        name: "SKILLzio",
        description: "Course Purchase",
        order_id: order.gatewayOrderId,
        handler: async function (razorpayResponse: any) {
          try {
            await checkoutCompleted({
              orderId: order._id,
              paymentId: razorpayResponse.razorpay_payment_id,
              method: "razorpay",
              amount: order.amount,
            });

            toast.success("Payment successful! You've been enrolled.");
            navigate("/user/enrolled");
          } catch {
            toast.error("Payment verification failed.");
          }
        },
        theme: {
          color: "#49BBBD",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage?.includes("already enrolled")) {
        toast.error(errorMessage);
      } else if (errorMessage?.includes("Insufficient wallet balance")) {
        toast.error("Insufficient wallet balance.");
      } else {
        toast.error("Payment initiation failed.");
      }
    }
  };

  const handleRemove = async (courseId: string, courseName: string) => {
    try {
      await removeFromCart(courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.info(`${courseName} removed from cart.`);
    } catch {
      toast.error("Failed to remove course.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        🧾 Checkout Summary
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : courses.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2 bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 text-gray-700 text-sm">
                <tr>
                  <th className="py-3 px-4 text-left">Thumbnail</th>
                  <th className="py-3 px-4 text-left">Course</th>
                  <th className="py-3 px-4 text-right">Price (₹)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.courseName}
                        className="w-20 h-14 object-cover rounded-md"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {course.courseName}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ₹{course.price}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          handleRemove(course._id, course.courseName)
                        }
                        className="text-red-500 hover:text-red-600 flex items-center gap-1 justify-center"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={2} className="py-3 px-4 text-right">
                    Total
                  </td>
                  <td className="py-3 px-4 text-right">₹{totalAmount}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Section */}
          <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
            <div>
              {/* Wallet */}
              {wallet && (
                <div className="mb-4 p-3 border rounded-lg bg-teal-50 text-teal-700">
                  <strong>💰 Wallet Balance:</strong> ₹
                  {wallet.balance.toFixed(2)}
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-gray-800">
                  Choose Payment Method:
                </h3>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="text-teal-500"
                    />
                    Razorpay
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={() => setPaymentMethod("wallet")}
                      className="text-teal-500"
                    />
                    Wallet
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg shadow-md font-semibold transition"
            >
              Pay ₹{totalAmount}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
