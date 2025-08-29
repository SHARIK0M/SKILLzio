import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EntityTable from "../../../components/common/EntityTable";
import { allOrder } from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface Order {
  _id: string;
  amount: number;
  createdAt: string;
  gateway: string;
}

interface DisplayOrder extends Order {
  formattedAmount: string;
  formattedDate: string;
  formattedGateway: string;
}

export default function StudentOrderHistoryPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 5;

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await allOrder(currentPage, pageSize);
      const formattedOrders: DisplayOrder[] = res.orders.map(
        (order: Order) => ({
          ...order,
          formattedDate: new Date(order.createdAt).toLocaleString(),
          formattedAmount: `₹${order.amount.toFixed(2)}`,
          formattedGateway: order.gateway.toUpperCase(),
        })
      );
      setOrders(formattedOrders);
      setTotalOrders(res.total);
    } catch (error) {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleView = (order: DisplayOrder) => {
    navigate(`/user/order/${order._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="relative bg-white shadow-xl border-b border-gray-100 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
          <div className="relative px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          <EntityTable<DisplayOrder>
            title="Order History"
            data={orders}
            columns={[
              { key: "_id", label: "Order ID" },
              { key: "formattedAmount", label: "Amount" },
              { key: "formattedGateway", label: "Gateway" },
              { key: "formattedDate", label: "Date" },
            ]}
            actionLabel="View"
            onAction={handleView}
            emptyText="No orders yet."
            pagination={{
              currentPage,
              totalItems: totalOrders,
              pageSize,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
    </div>
  );
}
