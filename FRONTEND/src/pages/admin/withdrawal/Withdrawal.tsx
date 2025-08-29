import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetAllWithdrawalRequests } from "../../../api/action/AdminActionApi";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { type IWithdrawalRequest } from "../../../types/interface/IWithdrawalRequest";

// Define interfaces for the populated data structure from the backend
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

// Extended interface for populated withdrawal request
interface IPopulatedWithdrawalRequest
  extends Omit<IWithdrawalRequest, "instructorId"> {
  instructor: IInstructor;
  bankAccount: IBankAccount;
}

export default function AdminWithdrawalPage() {
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState<
    IPopulatedWithdrawalRequest[]
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchWithdrawalRequests = async (pageNum = 1) => {
    try {
      const res = await adminGetAllWithdrawalRequests(pageNum, limit);
      setWithdrawalRequests(
        (res.transactions as unknown as IPopulatedWithdrawalRequest[]) || []
      );
      setPage(res.currentPage || 1);
      setTotalPages(res.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to load withdrawal requests");
    }
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/admin/withdrawals/${requestId}`);
  };

  useEffect(() => {
    fetchWithdrawalRequests(1);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold text-cyan-400">Withdrawal Requests</h1>

      <Card
        title="All Withdrawal Requests"
        className="bg-gray-800 border border-gray-700 shadow-lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-700 rounded-md overflow-hidden">
            <thead className="bg-gray-700 text-gray-300 uppercase text-xs font-semibold">
              <tr>
                <th className="py-3 px-4">Instructor Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalRequests.length ? (
                withdrawalRequests.map((request, index) => (
                  <tr
                    key={request._id}
                    className={`border-b border-gray-700 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
                    } hover:bg-cyan-900/40`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-100">
                          {request.instructor.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {request.instructor.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-cyan-400">
                      ₹{request.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          request.status === "approved"
                            ? "bg-green-900 text-green-300"
                            : request.status === "rejected"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleViewDetails(request._id)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-1"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="py-4 px-4 text-center text-gray-400"
                    colSpan={4}
                  >
                    No withdrawal requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => fetchWithdrawalRequests(pageNum)}
                  className={`px-3 py-1 rounded-md border ${
                    pageNum === page
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
