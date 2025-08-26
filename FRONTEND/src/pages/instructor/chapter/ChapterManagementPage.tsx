import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PlusCircle } from "lucide-react";

import EntityTable from "../../../components/common/EntityTable";
import Card from "../../../components/common/Card";

import {
  getChaptersByCourse,
  deleteChapter,
  instructorGetCourseById,
} from "../../../api/action/InstructorActionApi";

interface Chapter {
  _id: string;
  chapterTitle: string;
  chapterNumber: number;
  videoUrl: string;
}

const ChapterManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // more chapters per page
  const [total, setTotal] = useState(0);

  const fetchChapters = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [courseRes, chapterRes] = await Promise.all([
        instructorGetCourseById(courseId),
        getChaptersByCourse(courseId, page, limit, search),
      ]);

      setCourseName(courseRes?.data?.courseName || "");
      setChapters(chapterRes?.data || []);
      setTotal(chapterRes?.total || 0);
    } catch (error) {
      toast.error("Failed to fetch chapter data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [courseId, page, search]);

  const handleEdit = (chapter: Chapter) => {
    navigate(`/instructor/course/${courseId}/chapters/${chapter._id}/edit`);
  };

  const handleDelete = async (chapter: Chapter) => {
    try {
      await deleteChapter(courseId!, chapter._id);
      toast.success("Chapter deleted");
      fetchChapters(); // refresh
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  const handleAddChapter = () => {
    navigate(`/instructor/course/${courseId}/chapters/add`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-6 py-8 bg-[#121a29] min-h-screen text-white">
      <Card
        title={`Chapters of "${courseName}"`}
        padded
        className="bg-gray-900/80 border border-gray-700 rounded-3xl shadow-2xl backdrop-blur-md"
      >
        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500 text-white placeholder-gray-400"
          />
          <button
            onClick={handleAddChapter}
            className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg transition-transform transform hover:scale-105"
          >
            <PlusCircle size={18} />
            Add Chapter
          </button>
        </div>

        {/* Chapters Table */}
        {loading ? (
          <p className="text-gray-400 text-center py-6">Loading chapters...</p>
        ) : (
          <EntityTable
            title=""
            data={chapters}
            columns={[
              { key: "chapterNumber", label: "Chapter" },
              { key: "chapterTitle", label: "Title" },
              { key: "videoUrl", label: "Video URL" },
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyText="No chapters found for this course."
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 flex-wrap gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1 rounded-lg border ${
                    pageNumber === page
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChapterManagementPage;
