import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type Column,
  type ActionButton,
} from "../../../components/adminComponent/DataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import {
  getAllMembership,
  deleteMembership,
  toggleMembershipStatus,
} from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";

interface IMembershipPlan {
  _id: string;
  name: string;
  durationInDays: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

const MembershipPlanPage = () => {
  const [plans, setPlans] = useState<IMembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IMembershipPlan | null>(
    null
  );

  const navigate = useNavigate();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await getAllMembership({
        page: currentPage,
        limit,
        search: searchTerm,
      });
      console.log(response);
      setPlans(response.plans || []);
      setTotal(response.total || 0);
      setError(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to load membership plans";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentPage, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreate = () => {
    navigate("/admin/membership/add");
  };

  const handleEdit = (plan: IMembershipPlan) => {
    navigate(`/admin/membership/edit/${plan._id}`);
  };

  const handleDeletePrompt = (plan: IMembershipPlan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleTogglePrompt = (plan: IMembershipPlan) => {
    setSelectedPlan(plan);
    setToggleModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlan) return;
    try {
      await deleteMembership(selectedPlan._id);
      toast.success("Membership plan deleted");
      fetchPlans();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete membership plan"
      );
    } finally {
      setDeleteModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedPlan) return;
    try {
      await toggleMembershipStatus(selectedPlan._id);
      toast.success(
        `Plan ${
          selectedPlan.isActive ? "deactivated" : "activated"
        } successfully`
      );
      fetchPlans();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update plan status"
      );
    } finally {
      setToggleModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelModal = () => {
    setDeleteModalOpen(false);
    setToggleModalOpen(false);
    setSelectedPlan(null);
  };

  const columns: Column<IMembershipPlan>[] = [
    {
      key: "serialNo",
      title: "S.NO",
      render: (_val, _record, index) => (
        <span className="text-sm text-gray-900">
          {(currentPage - 1) * limit + index + 1}
        </span>
      ),
    },
    { key: "name", title: "Plan Name" },
    { key: "durationInDays", title: "Duration (Days)" },
    { key: "price", title: "Price (₹)" },
    {
      key: "isActive",
      title: "Status",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {val ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions: ActionButton<IMembershipPlan>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil size={16} />,
      onClick: handleEdit,
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: handleDeletePrompt,
      className: "bg-red-500 hover:bg-red-600 text-white",
    },
    {
      key: "toggle",
      label: "Toggle Status",
      icon: <CheckCircle size={16} />,
      onClick: handleTogglePrompt,
      className: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <DataTable
        title="Membership Plans"
        description="List of all instructor membership plans"
        data={plans}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error}
        onRetry={fetchPlans}
        emptyStateTitle="No Membership Plans Found"
        emptyStateDescription="Create a membership plan to get started."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search plans..."
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
        leftSideHeaderContent={
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={16} />
            Add Plan
          </button>
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Plan"
        message={`Are you sure you want to delete the "${selectedPlan?.name}" plan?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelModal}
      />

      {/* Toggle Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={toggleModalOpen}
        title={`${selectedPlan?.isActive ? "Deactivate" : "Activate"} Plan`}
        message={`Are you sure you want to ${
          selectedPlan?.isActive ? "deactivate" : "activate"
        } the "${selectedPlan?.name}" plan?`}
        confirmText={selectedPlan?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelModal}
      />
    </>
  );
};

export default MembershipPlanPage;
