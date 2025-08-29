import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  instructorGetWallet,
  instructorCreateWalletRechargeOrder,
  instructorVerifyPayment,
  instructorWalletTransactionHistory,
  instructorCreateWithdrawal,
  instructorGetWithdrawal,
  retryWithdrawal,
} from "../../../api/action/InstructorActionApi";
import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import InputField from "../../../components/common/InputField";

interface Transaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  txnId: string;
  date: string;
}

interface Wallet {
  balance: number;
}

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

// API response type with populated instructorId
interface IWithdrawalRequestResponse {
  _id: string;
  instructorId: IInstructor;
  bankAccount: IBankAccount;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  adminId?: string;
  remarks?: string;
}

export default function InstructorWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotalPages, setTxnTotalPages] = useState(1);
  const [withdrawalRequests, setWithdrawalRequests] = useState<IWithdrawalRequestResponse[]>([]);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalTotalPages, setWithdrawalTotalPages] = useState(1);
  const [showRetryModal, setShowRetryModal] = useState<{ show: boolean; requestId: string; currentAmount: number }>({
    show: false,
    requestId: "",
    currentAmount: 0,
  });
  const [retryAmount, setRetryAmount] = useState<number>(0);
  const limit = 5;

  const fetchWallet = async () => {
    try {
      const data = await instructorGetWallet();
      setWallet(data.wallet);
    } catch (error: any) {
      toast.error(error.message || "Failed to load wallet");
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await instructorWalletTransactionHistory(page, limit);
      setTransactions(res.data.transactions || []);
      setTxnPage(res.data.currentPage || 1);
      setTxnTotalPages(res.data.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to load transactions");
    }
  };

  const fetchWithdrawalRequests = async (page = 1) => {
    try {
      const res = await instructorGetWithdrawal(page, limit);
      console.log("getWithdrawal", res);
      
      // Type assertion since we know the API returns populated instructorId
      setWithdrawalRequests((res.transactions as unknown as IWithdrawalRequestResponse[]) || []);
      setWithdrawalPage(res.currentPage || 1);
      setWithdrawalTotalPages(res.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to load withdrawal requests");
    }
  };

  const handleAddMoney = async () => {
    try {
      if (!rechargeAmount || rechargeAmount < 1) {
        toast.warning("Enter a valid recharge amount");
        return;
      }
      setLoading(true);

      const orderData = await instructorCreateWalletRechargeOrder({ amount: rechargeAmount });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "SKILLZIO Instructor Wallet",
        description: "Wallet Recharge",
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
           await instructorVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: rechargeAmount,
            });
            toast.success("Wallet recharged successfully");
            setRechargeAmount(0);
            fetchWallet();
            fetchTransactions(1);
          } catch (error: any) {
            toast.error(error.message || "Payment verification failed");
          }
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithdrawal = async () => {
  try {
    if (!withdrawalAmount || withdrawalAmount < 1) {
      toast.warning("Enter a valid withdrawal amount");
      return;
    }
    if (!wallet || wallet.balance < withdrawalAmount) {
      toast.warning("Insufficient wallet balance");
      return;
    }

    setWithdrawalLoading(true);
    const response = await instructorCreateWithdrawal(withdrawalAmount);
    toast.success(response.message || "Withdrawal request created successfully");
    setWithdrawalAmount(0);
    fetchWallet();
    fetchWithdrawalRequests(1);
  } catch (error: any) {
    // Check for specific error message from backend
    const errorMessage =
      error.response?.data?.message || "Failed to create withdrawal request";
    toast.error(errorMessage);
  } finally {
    setWithdrawalLoading(false);
  }
};

  const handleRetryRequest = async () => {
    try {
      if (retryAmount <= 0) {
        toast.error("Invalid amount entered");
        return;
      }
      await retryWithdrawal(showRetryModal.requestId, retryAmount);
      toast.success("Withdrawal request retried successfully");
      fetchWallet();
      fetchWithdrawalRequests(withdrawalPage);
      setShowRetryModal({ show: false, requestId: "", currentAmount: 0 });
      setRetryAmount(0);
    } catch (error: any) {
      toast.error(error.message || "Failed to retry withdrawal request");
    }
  };

  const openRetryModal = (requestId: string, currentAmount: number) => {
    setShowRetryModal({ show: true, requestId, currentAmount });
    setRetryAmount(currentAmount);
  };

  const closeRetryModal = () => {
    setShowRetryModal({ show: false, requestId: "", currentAmount: 0 });
    setRetryAmount(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
      default:
        return "text-yellow-600";
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    const bgColor = status === "approved" ? "bg-green-100" : 
                   status === "rejected" ? "bg-red-100" : "bg-yellow-100";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} ${bgColor} capitalize`}>
        {status}
      </span>
    );
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions(1);
    fetchWithdrawalRequests(1);
  }, []);

return (
  <div className="px-6 py-6 space-y-8">
    <h1 className="text-2xl font-semibold mb-4">Instructor Wallet</h1>

    {/* Wallet Summary + Actions */}
    <Card padded>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <h2 className="text-3xl font-bold text-green-600">
            ₹{wallet?.balance.toFixed(2) || "0.00"}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-end">
            <InputField
              type="number"
              name="rechargeAmount"
              label="Add Amount"
              placeholder="Enter amount"
              useFormik={false}
              value={rechargeAmount || ""}
              onChange={(e) => setRechargeAmount(Number(e.target.value))}
            />
            <Button onClick={handleAddMoney} disabled={loading}>
              {loading ? "Processing..." : "Add Money"}
            </Button>
          </div>

          <div className="flex gap-2 items-end">
            <InputField
              type="number"
              name="withdrawalAmount"
              label="Withdraw Amount"
              placeholder="Enter amount"
              useFormik={false}
              value={withdrawalAmount || ""}
              onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
            />
            <Button
              onClick={handleCreateWithdrawal}
              disabled={withdrawalLoading}
            >
              {withdrawalLoading ? "Processing..." : "Request Withdrawal"}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    {/* Retry Modal */}
    {showRetryModal.show && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card padded className="max-w-md w-full mx-4">
          <h2 className="text-lg font-semibold mb-4">Retry Withdrawal</h2>
          <p className="text-sm text-gray-600 mb-4">
            Current amount: ₹{showRetryModal.currentAmount.toFixed(2)}
          </p>
          <InputField
            type="number"
            name="retryAmount"
            label="New Amount (optional)"
            placeholder="Enter new amount"
            useFormik={false}
            value={retryAmount || ""}
            onChange={(e) => setRetryAmount(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={closeRetryModal} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleRetryRequest}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )}

    {/* Transaction History */}
    <Card title="Transaction History" padded>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-md">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="py-3 px-4">Txn ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length ? (
              transactions.map((txn, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50`}
                >
                  <td className="py-3 px-4 font-mono text-blue-600 break-all">
                    {txn.txnId}
                  </td>
                  <td className="py-3 px-4 capitalize">{txn.type}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      txn.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{txn.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{txn.description}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatDate(txn.date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {txnTotalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: txnTotalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                onClick={() => fetchTransactions(pageNum)}
                variant={pageNum === txnPage ? "primary" : "secondary"}
                className="px-3 py-1 text-xs"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
      )}
    </Card>

    {/* Withdrawal Requests */}
    <Card title="Withdrawal Requests" padded>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-md">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="py-3 px-4">Instructor</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Remarks</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawalRequests.length ? (
              withdrawalRequests.map((req, idx) => (
                <tr
                  key={req._id}
                  className={`border-b ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50`}
                >
                  <td className="py-3 px-4 font-medium">
                    {req.instructorId.username}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    ₹{req.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                  <td className="py-3 px-4 text-xs">
                    {req.remarks?.trim() || "No remarks"}
                  </td>
                  <td className="py-3 px-4">
                    {req.status === "rejected" && (
                      <Button
                        onClick={() => openRetryModal(req._id, req.amount)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {withdrawalTotalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: withdrawalTotalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                onClick={() => fetchWithdrawalRequests(pageNum)}
                variant={pageNum === withdrawalPage ? "primary" : "secondary"}
                className="px-3 py-1 text-xs"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
      )}
    </Card>
  </div>
);

}