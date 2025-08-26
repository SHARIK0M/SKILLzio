import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type Column,
  type ActionButton,
} from "../../../components/adminComponent/DataTable";
import {
  getAllCourses,
  listUnListCourse,
} from "../../../api/action/AdminActionApi";
import { Eye, EyeOff, Info } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

interface AdminCourse {
  _id: string;
  courseName: string;
  isListed: boolean;
}

const AdminCourseManagementPage = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllCourses(search, page, limit);
      setCourses(result.data || []);
      const total = result.total || 0;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const requestToggleListing = (course: AdminCourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const confirmToggleListing = async () => {
    if (!selectedCourse) return;
    try {
      const updated = await listUnListCourse(selectedCourse._id);
      toast.success(
        `Course ${updated.data.isListed ? "listed" : "unlisted"} successfully`
      );
      fetchCourses();
    } catch (err: any) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to toggle listing");
      }
    } finally {
      setIsModalOpen(false);
      setSelectedCourse(null);
    }
  };

  const columns: Column<AdminCourse>[] = [
    {
      key: "serial",
      title: "S.No",
      render: (_value, _record, index) => (page - 1) * limit + index + 1,
      width: "60px",
    },
    {
      key: "courseName",
      title: "Course Name",
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: "isListed",
      title: "Status",
      render: (value: boolean) => (
        <span
          className={`px-3 py-1 text-sm rounded-full font-semibold ${
            value ? "bg-cyan-700 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          {value ? "Listed" : "Not Listed"}
        </span>
      ),
    },
  ];

  const actions: ActionButton<AdminCourse>[] = [
    {
      key: "toggleListing",
      label: (record) => (record.isListed ? "Unlist" : "List"),
      icon: (record) =>
        record.isListed ? <EyeOff size={18} /> : <Eye size={18} />,
      onClick: (record) => requestToggleListing(record),
      className: (record) =>
        record.isListed
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-cyan-600 hover:bg-cyan-500 text-white",
    },
    {
      key: "viewDetails",
      label: "View",
      icon: () => <Info size={18} />,
      onClick: (record) => navigate(`/admin/courses/${record._id}`),
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchCourses();
  }, [search, page]);

  return (
    <>
      <DataTable
        data={courses}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error}
        title="Course Management"
        description="Manage listed and unlisted courses from instructors."
        onRetry={fetchCourses}
        emptyStateTitle="No Courses Available"
        emptyStateDescription="There are no courses to display at this moment."
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by course name"
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange: handlePageChange,
        }}
        // leftSideHeaderContent removed
      />

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Please Confirm"
        message={`Are you sure you want to ${
          selectedCourse?.isListed ? "unlist" : "list"
        } the course "${selectedCourse?.courseName}"?`}
        confirmText={selectedCourse?.isListed ? "Unlist" : "List"}
        cancelText="Cancel"
        onConfirm={confirmToggleListing}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
      />
    </>
  );
};

export default AdminCourseManagementPage;
