import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMembershipPurchaseHistoryDetail } from "../../../api/action/AdminActionApi";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

interface Instructor {
  name: string;
  email: string;
}

interface MembershipPlan {
  name: string;
  durationInDays: number;
}

interface MembershipOrder {
  instructor: Instructor;
  membershipPlan: MembershipPlan;
  price: number;
  paymentStatus: "pending" | "paid" | "failed";
  startDate: string;
  endDate: string;
  txnId: string;
  createdAt: string;
}

const MembershipOrderDetail: React.FC = () => {
  const { txnId } = useParams<{ txnId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<MembershipOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await getMembershipPurchaseHistoryDetail(txnId!);
      setOrder(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load order detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [txnId]);

  return (
    <div className="min-h-screen p-6 bg-[#111827] text-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="mr-1" size={18} />
          Back
        </button>

        {/* Container */}
        <div className="bg-[#1e293b] rounded-3xl shadow-lg border border-cyan-700 p-8">
          <h2 className="text-3xl font-extrabold text-cyan-400 mb-6">
            Membership Order Details
          </h2>

          {loading ? (
            <div className="text-center py-16 text-cyan-300 font-medium">
              Loading...
            </div>
          ) : order ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cyan-200">
              <div>
                <h3 className="font-semibold text-white mb-1">Instructor</h3>
                <p>{order.instructor.name}</p>
                <p className="text-cyan-400">{order.instructor.email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">Plan</h3>
                <p>{order.membershipPlan.name}</p>
                <p className="text-cyan-400">
                  {order.membershipPlan.durationInDays} days
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">Price</h3>
                <p>₹{order.price}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">
                  Payment Status
                </h3>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-600/20 text-green-400"
                      : order.paymentStatus === "failed"
                      ? "bg-red-600/20 text-red-400"
                      : "bg-yellow-400/20 text-yellow-300"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">Start Date</h3>
                <p>{new Date(order.startDate).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">End Date</h3>
                <p>{new Date(order.endDate).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">
                  Transaction ID
                </h3>
                <p>{order.txnId}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-1">Created At</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-cyan-400 font-medium">
              No order data found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipOrderDetail;
