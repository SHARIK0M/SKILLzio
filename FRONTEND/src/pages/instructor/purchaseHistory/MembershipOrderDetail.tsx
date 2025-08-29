import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  membershipDetail,
  downloadReceiptForMembership,
} from "../../../api/action/InstructorActionApi";
import { Download } from "lucide-react";

interface MembershipPlan {
  name: string;
  durationInDays: number;
  description?: string;
  benefits?: string[];
}

interface InstructorInfo {
  username: string;
  email: string;
}

interface MembershipOrder {
  membershipPlanId: MembershipPlan;
  instructorId: InstructorInfo;
  price: number;
  paymentStatus: "pending" | "paid";
  txnId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const MembershipOrderDetail = () => {
  const { txnId } = useParams<{ txnId: string }>();
  const [order, setOrder] = useState<MembershipOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!txnId) return;
        const data = await membershipDetail(txnId);
        setOrder(data);
      } catch (err) {
        toast.error("Failed to load membership order.");
        navigate("/instructor/purchaseHistory");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [txnId, navigate]);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (!order) return <p className="p-6 text-red-400">Order not found.</p>;

  const plan = order.membershipPlanId;
  const instructor = order.instructorId;
  const isWalletPayment = order.txnId.startsWith("wallet_");

  const handleDownload = async () => {
    try {
      await downloadReceiptForMembership(order.txnId);
      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download receipt.");
    }
  };

  return (
    <div className="px-6 py-8 bg-[#121a29] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Membership Order Details
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            Order placed on{" "}
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' hh:mm a")}
          </p>
        </div>
        {order.paymentStatus === "paid" && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-4 py-2 rounded-2xl shadow font-semibold transition-transform transform hover:scale-105"
          >
            <Download size={16} />
            Download Receipt
          </button>
        )}
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
          <p className="text-gray-400 text-sm">Customer</p>
          <p className="text-white font-semibold">{instructor.username}</p>
          <p className="text-gray-300 text-sm">{instructor.email}</p>
        </div>

        {/* Payment */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
          <p className="text-gray-400 text-sm">Payment</p>
          <p className="text-white font-semibold">
            {isWalletPayment ? "Wallet" : "Razorpay"}
          </p>
          <p className="text-lg font-bold text-orange-400">₹{order.price}</p>
        </div>

        {/* Status */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
          <p className="text-gray-400 text-sm">Status</p>
          <p
            className={`inline-block font-semibold text-sm px-2 py-1 rounded-full ${
              order.paymentStatus === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.paymentStatus.toUpperCase()}
          </p>
          <p className="text-gray-400 text-xs mt-1">Txn ID: {order.txnId}</p>
        </div>
      </div>

      {/* Membership Plan */}
      <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
        <p className="text-white font-semibold text-lg mb-2">Membership Plan</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
          <div>
            <p className="text-gray-400 text-sm">Plan Name</p>
            <p className="font-semibold">{plan.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Duration</p>
            <p className="font-semibold">{plan.durationInDays} days</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Start Date</p>
            <p className="font-semibold">
              {format(new Date(order.startDate), "dd MMM yyyy")}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">End Date</p>
            <p className="font-semibold">
              {format(new Date(order.endDate), "dd MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
          <p className="text-gray-400 text-sm mb-1">Description</p>
          <p className="text-white">{plan.description}</p>
        </div>
      )}

      {/* Benefits */}
      {Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 shadow">
          <p className="text-gray-400 text-sm mb-1">Benefits</p>
          <ul className="list-disc pl-6 text-white">
            {plan.benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MembershipOrderDetail;
