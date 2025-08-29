import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  adminGetWithdrawalRequestById,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
} from "../../../api/action/AdminActionApi";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";

// Define interfaces for the populated data structure
interface IInstructor {
  _id: string;
  username: string;
  email: string;
}

interface IBankAccount {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

interface IPopulatedWithdrawalRequest {
  _id: string;
  instructorId: IInstructor;
  amount: number;
  status: "pending" | "approved" | "rejected";
  bankAccount: IBankAccount;
  createdAt: string;
  updatedAt: string;
  adminId?: string;
  remarks?: string;
  __v?: number;
}

export default function WithdrawalDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [withdrawalRequest, setWithdrawalRequest] =
    useState<IPopulatedWithdrawalRequest | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [remarksError, setRemarksError] = useState<string | null>(null);

  const fetchWithdrawalRequest = async () => {
    if (!requestId) {
      toast.error("Invalid request ID");
      navigate("/admin/withdrawal");
      return;
    }

    try {
      setPageLoading(true);
      const response = await adminGetWithdrawalRequestById(requestId);
      setWithdrawalRequest(
        response.data as unknown as IPopulatedWithdrawalRequest
      );
      setRemarks(response.data.remarks || "");
    } catch (error: any) {
      toast.error(error.message || "Failed to load withdrawal request");
      navigate("/admin/withdrawal");
    } finally {
      setPageLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!withdrawalRequest) return;

    try {
      setLoading(true);
      const response = await adminApproveWithdrawal(
        withdrawalRequest._id,
        remarks
      );
      toast.success(
        response.message || "Withdrawal request approved successfully"
      );
      fetchWithdrawalRequest();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!withdrawalRequest) return;

    if (!remarks.trim()) {
      setRemarksError(
        "Remarks are required when rejecting a withdrawal request"
      );
      toast.error("Please provide remarks before rejecting the request");
      return;
    }

    try {
      setLoading(true);
      setRemarksError(null);
      const response = await adminRejectWithdrawal(
        withdrawalRequest._id,
        remarks
      );
      toast.success(
        response.message || "Withdrawal request rejected successfully"
      );
      fetchWithdrawalRequest();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject withdrawal request");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-900/40 text-green-300 border-green-700";
      case "rejected":
        return "bg-red-900/40 text-red-300 border-red-700";
      case "pending":
        return "bg-yellow-900/40 text-yellow-300 border-yellow-700";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  useEffect(() => {
    fetchWithdrawalRequest();
  }, [requestId]);

  if (pageLoading) {
    return (
      <div className="p-4 space-y-6 text-cyan-100 bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">
              Loading withdrawal request details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!withdrawalRequest) {
    return (
      <div className="p-4 space-y-6 bg-gray-900 text-cyan-100 min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Withdrawal request not found.</p>
          <Button
            onClick={() => navigate("/admin/withdrawal")}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700"
          >
            Back to Withdrawals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto text-cyan-100 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-400">
            Withdrawal Request Details
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Request ID: {withdrawalRequest._id}
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/withdrawal")}
          className="bg-gray-700 hover:bg-gray-600"
        >
          ← Back to List
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center">
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium capitalize border ${getStatusColor(
            withdrawalRequest.status
          )}`}
        >
          {withdrawalRequest.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instructor Information */}
        <Card title="Instructor Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Name</label>
              <p className="text-lg font-semibold text-cyan-300">
                {withdrawalRequest.instructorId.username}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <p className="text-gray-300">
                {withdrawalRequest.instructorId.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                Instructor ID
              </label>
              <p className="font-mono text-sm text-cyan-400 bg-gray-800 px-2 py-1 rounded">
                {withdrawalRequest.instructorId._id}
              </p>
            </div>
          </div>
        </Card>

        {/* Request Information */}
        <Card title="Request Information">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">
                Amount
              </label>
              <p className="text-2xl font-bold text-green-400">
                ₹{withdrawalRequest.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                Requested Date
              </label>
              <p className="text-gray-300">
                {formatDate(withdrawalRequest.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                Last Updated
              </label>
              <p className="text-gray-300">
                {formatDate(withdrawalRequest.updatedAt)}
              </p>
            </div>
            {withdrawalRequest.adminId && (
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Processed by Admin ID
                </label>
                <p className="font-mono text-sm text-purple-400 bg-gray-800 px-2 py-1 rounded">
                  {withdrawalRequest.adminId}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bank Account Information */}
      <Card title="Bank Account Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-400">
              Account Holder Name
            </label>
            <p className="text-lg font-semibold text-cyan-300">
              {withdrawalRequest.bankAccount.accountHolderName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">
              Bank Name
            </label>
            <p className="text-gray-300">
              {withdrawalRequest.bankAccount.bankName}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">
              Account Number
            </label>
            <p className="font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
              {withdrawalRequest.bankAccount.accountNumber.startsWith("$2b$")
                ? "••••••••••••••••"
                : withdrawalRequest.bankAccount.accountNumber}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">
              IFSC Code
            </label>
            <p className="font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
              {withdrawalRequest.bankAccount.ifscCode.startsWith("$2b$")
                ? "••••••••••••"
                : withdrawalRequest.bankAccount.ifscCode}
            </p>
          </div>
        </div>
      </Card>

      {/* Remarks Section */}
      <Card title="Remarks">
        <div className="space-y-4">
          {withdrawalRequest.remarks &&
            withdrawalRequest.status !== "pending" && (
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Current Remarks
                </label>
                <p className="text-gray-200 bg-gray-800 p-3 rounded-lg">
                  {withdrawalRequest.remarks}
                </p>
              </div>
            )}

          {withdrawalRequest.status === "pending" && (
            <div>
              <label
                htmlFor="remarks"
                className="block text-cyan-300 text-xs sm:text-sm font-semibold mb-1"
              >
                ADMIN REMARKS
              </label>
              <div className="relative flex flex-col">
                <textarea
                  className={`w-full px-3 sm:px-5 py-2 sm:py-3 rounded-lg font-medium border-2 ${
                    remarksError ? "border-red-500" : "border-gray-700"
                  } text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 bg-gray-800`}
                  placeholder="Enter remarks (required for rejection)"
                  id="remarks"
                  name="remarks"
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    setRemarksError(null);
                  }}
                  disabled={loading}
                  rows={4}
                />
                {remarksError && (
                  <span className="text-xs sm:text-sm font-semibold text-red-400 mt-1 ml-2 sm:ml-3">
                    {remarksError}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      {withdrawalRequest.status === "pending" && (
        <Card title="Actions">
          <div className="flex gap-4">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 flex-1 py-3"
            >
              {loading ? "Processing..." : "✓ Approve Request"}
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 flex-1 py-3"
            >
              {loading ? "Processing..." : "✗ Reject Request"}
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            * This action cannot be undone. Please review all details carefully
            before proceeding. Remarks are required for rejection.
          </p>
        </Card>
      )}

      {/* Status Message for processed requests */}
      {withdrawalRequest.status !== "pending" && (
        <Card title="Status Information">
          <div
            className={`p-4 rounded-lg border-l-4 ${
              withdrawalRequest.status === "approved"
                ? "bg-green-900/40 border-green-500"
                : "bg-red-900/40 border-red-500"
            }`}
          >
            <p
              className={`font-medium ${
                withdrawalRequest.status === "approved"
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              This withdrawal request has been {withdrawalRequest.status}.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Processed on: {formatDate(withdrawalRequest.updatedAt)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
