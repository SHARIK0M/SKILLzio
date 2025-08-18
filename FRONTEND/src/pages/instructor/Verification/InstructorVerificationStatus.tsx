import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVerificationRequestByemail } from "../../../api/action/InstructorActionApi";
import { Loader } from "lucide-react";
import type { IVerificationRequest } from "../../../types/interface/IVerificationRequest"

const InstructorVerificationStatus = () => {
  const { email } = useParams<{ email: string }>(); // 👈 extract from URL
  const [request, setRequest] = useState<IVerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    if (!email) return;

    try {
      const res = await getVerificationRequestByemail(email);
      setRequest(res?.data);
    } catch (error) {
      console.error("Failed to fetch verification status", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [email]);

  if (loading) {
    return <div className="flex justify-center mt-10"><Loader className="animate-spin" /></div>;
  }

  if (!request) {
    return <div className="text-center text-red-500 mt-10">No request found.</div>;
  }
return (
  <div className="max-w-xl mx-auto mt-12 p-8 bg-gradient-to-tr from-purple-50 via-pink-50 to-yellow-50 rounded-3xl shadow-lg border border-pink-200">
    <h2 className="text-2xl font-extrabold mb-6 text-purple-700 text-center tracking-wide">
      Verification Status
    </h2>

    <div className="text-center mb-6">
      <span
        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold tracking-wide
          ${
            request.status === "approved"
              ? "bg-green-200 text-green-800"
              : request.status === "rejected"
              ? "bg-red-200 text-red-800"
              : "bg-yellow-200 text-yellow-800"
          }
        `}
      >
        {request.status.toUpperCase()}
      </span>
    </div>

    {request.status === "pending" && (
      <p className="text-yellow-700 font-semibold text-center mb-6">
        Your verification request is currently under review. Please wait
        patiently.
      </p>
    )}

    {request.status === "rejected" && (
      <>
        <p className="text-red-700 font-semibold mb-4 text-center">
          Rejected: {request.rejectionReason || "No reason provided."}
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/instructor/reverify")}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-8 rounded-full shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300"
          >
            Re-Verify Now
          </button>
        </div>
      </>
    )}

    {request.status === "approved" && (
      <>
        <p className="text-green-700 font-semibold mb-6 text-center flex items-center justify-center gap-2">
          <svg
            className="w-6 h-6 inline-block text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          You are now a verified instructor on SKILLzio!
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-full shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Go to Dashboard
          </button>
        </div>
      </>
    )}
  </div>
);

};

export default InstructorVerificationStatus;
