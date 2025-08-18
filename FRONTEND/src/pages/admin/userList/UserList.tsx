import React, { useEffect, useState } from "react";
import { UserX, UserCheck, Users } from "lucide-react";
import DataTable, {
  type Column,
  type ActionButton,
} from "../../../components/adminComponent/DataTable";
import { getAllUser, blockUser } from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface User {
  id: string;
  username: string;
  email: string;
  status: "Blocked" | "Active";
  created: string;
  isBlocked: boolean;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUser(page, limit, search);

      if (!data || !Array.isArray(data.users)) {
        throw new Error("Invalid user data received");
      }

      const formattedUsers: User[] = data.users.map((user: any) => ({
        id: user._id,
        username: user.username || "N/A",
        email: user.email || "N/A",
        status: user.isBlocked ? "Blocked" : "Active",
        created: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-GB")
          : "N/A",
        isBlocked: user.isBlocked || false,
      }));

      setUsers(formattedUsers);
      setTotal(data.total || 0);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search]);

  const handleBlockToggle = async (user: User) => {
    const action = user.status === "Blocked" ? "unblock" : "block";

    const result = await Swal.fire({
      title: `Are you sure you want to ${action} this user?`,
      text: `User: ${user.username} (${user.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "block" ? "#d33" : "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${action} it!`,
    });

    if (result.isConfirmed) {
      try {
        const response = await blockUser(user.email);
        if (response.success) {
          toast.success(response.message);
          setUsers((prev) =>
            prev.map((u) =>
              u.email === user.email
                ? {
                    ...u,
                    status: u.status === "Blocked" ? "Active" : "Blocked",
                    isBlocked: !u.isBlocked,
                  }
                : u
            )
          );
        } else {
          toast.error(response.message);
        }
      } catch (error: any) {
        toast.error(error.message || "Error occurred while blocking user");
      }
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns: Column<User>[] = [
    {
      key: "serialNo",
      title: "S.NO",
      render: (_, __, index) => (
        <span className="text-sm text-white">
          {(page - 1) * limit + index + 1}
        </span>
      ),
    },
    {
      key: "username",
      title: "Name",
      render: (value) => (
        <div className="text-sm font-medium text-white">{value}</div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (value) => <div className="text-sm text-white">{value}</div>,
    },
    {
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            value === "Blocked"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "created",
      title: "Created",
      render: (value) => <span className="text-sm text-white">{value}</span>,
    },
  ];

  const actions: ActionButton<User>[] = [
    {
      key: "block-toggle",
      label: (user) =>
        user.status === "Blocked" ? "Unblock User" : "Block User",
      icon: (user) =>
        user.status === "Blocked" ? (
          <UserCheck size={16} />
        ) : (
          <UserX size={16} />
        ),
      onClick: handleBlockToggle,
      className: (user) =>
        user.status === "Blocked"
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-green-500 hover:bg-green-600 text-white",
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-4">
      <DataTable
        data={users}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error}
        title="User List"
        description="Manage and monitor all registered users"
        onRetry={fetchUsers}
        emptyStateIcon={<Users size={48} className="text-gray-300" />}
        emptyStateTitle="No users available"
        emptyStateDescription="No users have been registered yet."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name or email"
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default UserList;
