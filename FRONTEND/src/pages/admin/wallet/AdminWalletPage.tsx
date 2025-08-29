import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getWallet,
  createWalletRechargeOrder,
  verifyPayment,
  adminWalletTransactionHistory,
} from "../../../api/action/AdminActionApi";
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

export default function AdminWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      setWallet(data.wallet);
    } catch (error) {
      toast.error("Failed to load wallet");
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await adminWalletTransactionHistory(page, limit);
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  const handleAddMoney = async () => {
    if (!amount || amount < 1) return toast.warning("Enter a valid amount");

    try {
      setLoading(true);

      const orderData = await createWalletRechargeOrder({ amount });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "SKILLZIO Admin Wallet",
        description: "Wallet Recharge",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            const verifyData = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            });

            console.log("✅ Admin Wallet Verified:", verifyData);
            toast.success("Wallet recharged successfully");
            setAmount(0);
            fetchWallet();
            fetchTransactions(1);
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#06b6d4" }, // cyan theme
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions(1);
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-cyan-400">Admin Wallet</h1>

      {/* Wallet Balance Card */}
      <Card className="bg-gray-800 border border-cyan-700 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm text-gray-400">Current Balance</p>
            <h2 className="text-4xl font-extrabold text-cyan-400 mt-1">
              ₹{wallet?.balance.toFixed(2) || "0.00"}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <InputField
              type="number"
              placeholder="Enter amount"
              name="walletAmount"
              label="Add Amount"
              useFormik={false}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              
            />
            <Button
              onClick={handleAddMoney}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl shadow-md transition"
            >
              {loading ? "Processing..." : "Add Money"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card className="bg-gray-800 border border-cyan-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Transaction History
        </h2>
        <div className="overflow-x-auto rounded-xl border border-cyan-700">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-900 text-cyan-400 uppercase text-xs font-semibold">
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
                transactions.map((txn, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-700 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    } hover:bg-cyan-900/40`}
                  >
                    <td className="py-3 px-4 text-cyan-400 font-mono break-all">
                      {txn.txnId}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium">
                      {txn.type}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        txn.type === "credit"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{txn.description}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(txn.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="py-6 px-4 text-center text-gray-500"
                    colSpan={5}
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => fetchTransactions(pageNum)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    pageNum === currentPage
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-cyan-800 hover:text-white"
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
