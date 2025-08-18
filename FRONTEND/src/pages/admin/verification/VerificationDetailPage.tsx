import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getVerificationRequestByemail,
  updateVerificationStatus,
} from "../../../api/action/AdminActionApi";

import { Loader } from "lucide-react";
import { toast } from "react-toastify";

interface VerificationRequest {
  _id: string;
  username: string;
  email: string;
  status: string;
  resumeUrl: string;
  degreeCertificateUrl: string;
  reviewedAt?: Date;
}

const VerificationDetailsPage = () => {
  const { email } = useParams<{ email: string }>();
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingLoading, setApprovingLoading] = useState(false);
  const [rejectingLoading, setRejectingLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequest = async () => {
    try {
      const res = await getVerificationRequestByemail(email!);
      setRequest(res?.data);
    } catch (err) {
      toast.error("Failed to load verification details.");
      console.error("Error fetching request details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      // Set the appropriate loading state
      if (status === "approved") {
        setApprovingLoading(true);
      } else {
        setRejectingLoading(true);
      }

      await updateVerificationStatus(email!, status, rejectionReason);
      toast.success(
        status === "approved"
          ? "Verification approved successfully."
          : "Verification rejected successfully."
      );
      setRequest((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      toast.error("Failed to update verification status.");
      console.error("Error updating status", err);
    } finally {
      // Reset the appropriate loading state
      if (status === "approved") {
        setApprovingLoading(false);
      } else {
        setRejectingLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [email]);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center text-red-500 mt-10">Request not found.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-[#1e293b] rounded-xl shadow-lg mt-10 border border-cyan-800 text-cyan-300">
      <h2 className="text-3xl font-extrabold mb-6 text-white tracking-wide">
        Instructor Verification Details
      </h2>

      <div className="space-y-5">
        <div className="flex justify-between border-b border-cyan-700 pb-2">
          <span className="font-semibold text-white">Name:</span>
          <span>{request.username}</span>
        </div>

        <div className="flex justify-between border-b border-cyan-700 pb-2">
          <span className="font-semibold text-white">Email:</span>
          <span>{request.email}</span>
        </div>

        <div className="flex justify-between border-b border-cyan-700 pb-2 items-center">
          <span className="font-semibold text-white">Status:</span>
          <span
            className={`px-3 py-1 rounded-full font-semibold text-sm ${
              request.status === "approved"
                ? "bg-green-100 text-green-800"
                : request.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        <div className="flex justify-between border-b border-cyan-700 pb-2">
          <span className="font-semibold text-white">Resume:</span>
          <a
            href={request.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-200 underline font-medium"
          >
            View Resume
          </a>
        </div>

        <div className="flex justify-between border-b border-cyan-700 pb-2">
          <span className="font-semibold text-white">Degree Certificate:</span>
          <a
            href={request.degreeCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-200 underline font-medium"
          >
            View Certificate
          </a>
        </div>

        {request.reviewedAt && (
          <div className="flex justify-between border-b border-cyan-700 pb-2">
            <span className="font-semibold text-white">Reviewed At:</span>
            <span>{new Date(request.reviewedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {request.status === "pending" && (
        <div className="mt-8 space-y-6">
          <div className="flex gap-5">
            <button
              disabled={approvingLoading || rejectingLoading}
              onClick={() => handleStatusUpdate("approved")}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              {approvingLoading ? "Approving..." : "Approve"}
            </button>

            <button
              disabled={approvingLoading || rejectingLoading}
              onClick={() => handleStatusUpdate("rejected")}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              {rejectingLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason for Rejection (optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="E.g. Missing documents, blurry resume, etc."
              className="w-full rounded-lg border border-cyan-700 p-3 bg-[#111827] text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetailsPage;
