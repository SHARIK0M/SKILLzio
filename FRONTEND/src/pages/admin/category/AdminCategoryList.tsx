import { useEffect, useState } from "react";
import { Pencil, ShieldX, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type Column,
  type ActionButton,
} from "../../../components/adminComponent/DataTable";
import {
  getAllCategories,
  toggleCategoryStatus,
} from "../../../api/action/AdminActionApi";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

// ✅ Define Category type
interface Category {
  _id: string;
  categoryName: string;
  isListed: boolean;
}

type ModalAction = "toggle" | "edit" | null;

const AdminCategoryListPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // ✅ Group modal state into one object
  const [modal, setModal] = useState<{
    open: boolean;
    action: ModalAction;
    category: Category | null;
  }>({ open: false, action: null, category: null });

  const navigate = useNavigate();

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories(currentPage, limit, searchTerm);
      if (!response || !Array.isArray(response.data))
        throw new Error("Invalid category data received");

      setCategories(response.data);
      setTotal(response.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]);

  // ✅ Modal Handlers
  const openModal = (action: ModalAction, category: Category) => {
    setModal({ open: true, action, category });
  };

  const closeModal = () => {
    setModal({ open: false, action: null, category: null });
  };

  const handleConfirmAction = async () => {
    if (!modal.category) return;

    if (modal.action === "toggle") {
      try {
        await toggleCategoryStatus(modal.category._id);
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
    } else if (modal.action === "edit") {
      navigate(`/admin/category/edit/${modal.category._id}`);
    }

    closeModal();
  };

  // ✅ Other Handlers
  const handleAddCategory = () => navigate("/admin/addCategory");
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => setCurrentPage(page);

  // ✅ Columns
  const columns: Column[] = [
    {
      key: "serialNo",
      title: "S.NO",
      render: (_value, _record, index) => (
        <span className="text-sm text-gray-900">
          {(currentPage - 1) * limit + index + 1}
        </span>
      ),
    },
    { key: "categoryName", title: "Category Name" },
    {
      key: "isListed",
      title: "Listed",
      render: (value: boolean) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  // ✅ Actions
  const actions: ActionButton[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil size={16} />,
      onClick: (record: Category) => openModal("edit", record),
    },
    {
      key: "toggle",
      label: (record: Category) => (record.isListed ? "Unlist" : "List"),
      icon: (record: Category) =>
        record.isListed ? <ShieldX size={16} /> : <ShieldCheck size={16} />,
      onClick: (record: Category) => openModal("toggle", record),
      className: (record: Category) =>
        record.isListed
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-green-500 hover:bg-green-600 text-white",
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <DataTable
        title="Categories"
        description="View, edit, or toggle category status."
        data={categories}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error}
        onRetry={fetchCategories}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
        leftSideHeaderContent={
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Category
          </button>
        }
      />

      {/* ✅ Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.open}
        title="Confirm Action"
        message={
          modal.action === "toggle"
            ? `Do you want to ${modal.category?.isListed ? "unlist" : "list"} ${
                modal.category?.categoryName
              }?`
            : `Do you want to edit ${modal.category?.categoryName}?`
        }
        confirmText={
          modal.action === "toggle"
            ? modal.category?.isListed
              ? "Unlist"
              : "List"
            : "Edit"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={closeModal}
      />
    </>
  );
};

export default AdminCategoryListPage;
