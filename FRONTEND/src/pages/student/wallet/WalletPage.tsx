import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getWallet,
  createWalletRechargeOrder,
  verifyPayment,
  walletTransactionHistory,
} from "../../../api/action/StudentAction";
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

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      console.log(data);
      setWallet(data.wallet);
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to load wallet");
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await walletTransactionHistory(page, limit);
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load transactions");
    }
  };

  const handleAddMoney = async () => {
    try {
      if (!amount || amount < 1) return toast.warning("Enter valid amount");
      setLoading(true);

      const orderData = await createWalletRechargeOrder({ amount });
      console.log("orderData", orderData);

      console.log("razorid", import.meta.env.VITE_RAZORPAY_KEY_ID);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "SKILLZIO Wallet",
        description: "Wallet Recharge",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            });
            toast.success("Wallet recharged successfully");
            setAmount(0);
            fetchWallet();
            fetchTransactions(1);
          } catch (error: any) {
            console.log(error);
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.log(error);
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
    <div className="relative min-h-screen">
      {/* Background decorations matching student layout */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-32 translate-y-32 -z-10"></div>

      <div className="relative space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">💳</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  My Wallet
                </h1>
                <p className="text-gray-600 font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Manage your balance and transactions</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wallet Balance Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            {/* Card header gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-t-[22px] px-8 pt-6 pb-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm px-8 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Current Balance
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      ₹{wallet?.balance.toFixed(2) || "0.00"}
                    </h2>
                    <span className="text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center space-x-1">
                      <span>🔒</span>
                      <span>Secure & Encrypted</span>
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center space-x-1">
                      <span>⚡</span>
                      <span>Instant Transactions</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="min-w-0 flex-1 sm:max-w-xs">
                    <InputField
                      type="number"
                      placeholder="Enter amount"
                      name="walletAmount"
                      label="Add Amount"
                      useFormik={false}
                      value={amount || ""}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>
                  <button
                    onClick={handleAddMoney}
                    disabled={loading}
                    className="group px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>💰</span>
                          <span>Add Money</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Transaction History */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-8 py-6 border-b border-gray-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Transaction History
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Track all your wallet activities
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 backdrop-blur-sm">
                  {transactions.length ? (
                    transactions.map((txn, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100/50 transition-all duration-300 hover:bg-emerald-50/30 group ${
                          index % 2 === 0 ? "bg-white/60" : "bg-gray-50/40"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-blue-600 font-mono text-xs break-all group-hover:text-emerald-600 transition-colors">
                              {txn.txnId}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              txn.type === "credit"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span>{txn.type === "credit" ? "💰" : "💸"}</span>
                            <span className="capitalize">{txn.type}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-bold text-lg ${
                              txn.type === "credit"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type === "credit" ? "+" : "-"}₹
                            {txn.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700 font-medium">
                            {txn.description}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-500 space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(txn.date).toLocaleDateString("en-IN")}
                            </div>
                            <div className="text-xs">
                              {new Date(txn.date).toLocaleTimeString("en-IN")}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-12 px-6 text-center text-gray-500"
                        colSpan={5}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm">
                              Your transaction history will appear here
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 px-6 py-4 border-t border-gray-100/50">
                <div className="flex justify-center items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => fetchTransactions(page)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm ${
                          page === currentPage
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg transform scale-105"
                            : "bg-white/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md border border-gray-200/50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
