import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";

import Card from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import EntityTable from "../../../components/common/EntityTable";

import {
  getPaginatedQuestionsByCourseId,
  deleteQuiz,
  deleteQuestionFromQuiz,
} from "../../../api/action/InstructorActionApi";

import { type IQuestion } from "../../../types/interface/IQuiz";

const QuizManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<
    (IQuestion & { quizId?: string })[]
  >([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchQuestions = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await getPaginatedQuestionsByCourseId(
        courseId,
        page,
        limit,
        search
      );

      const derivedQuizId =
        response.quizId || (response.questions[0]?._id ?? null);
      const questionsWithQuizId = response.questions.map((q: IQuestion) => ({
        ...q,
        quizId: derivedQuizId,
      }));

      setQuestions(questionsWithQuizId);
      setQuizId(derivedQuizId);
      setTotal(response.total || 0);
    } catch (error: any) {
      setQuestions([]);
      setQuizId(null);
      setTotal(0);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string, quizId: string) => {
    try {
      await deleteQuestionFromQuiz(quizId, questionId);
      toast.success("Question deleted");
      fetchQuestions();
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizId) return;
    try {
      await deleteQuiz(quizId);
      toast.success("Quiz deleted");
      fetchQuestions();
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId, page, search]);

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quiz Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage quiz and questions for this course
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {quizId ? (
              <>
                <Button
                  onClick={() =>
                    navigate(`/instructor/course/${courseId}/quiz/add`)
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
                <Button
                  onClick={handleDeleteQuiz}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Quiz
                </Button>
              </>
            ) : (
              <Button
                onClick={() =>
                  navigate(`/instructor/course/${courseId}/quiz/add`)
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Card Section */}
        <Card padded className="bg-white shadow-md rounded-xl">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search questions..."
              className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-sm text-gray-600">Loading questions...</p>
          ) : questions.length > 0 ? (
            <EntityTable
              title="All Quiz Questions"
              data={questions}
              columns={[
                { key: "questionText", label: "Question" },
                { key: "correctAnswer", label: "Correct Answer" },
              ]}
              onEdit={(q) =>
                navigate(
                  `/instructor/course/${courseId}/quiz/edit/${q.quizId}?questionId=${q._id}`
                )
              }
              onDelete={(q) => {
                if (q._id && q.quizId) handleDeleteQuestion(q._id, q.quizId);
              }}
              emptyText="No questions found"
              pagination={{
                currentPage: page,
                totalItems: total,
                pageSize: limit,
                onPageChange: (p) => setPage(p),
              }}
            />
          ) : (
            <p className="text-sm text-gray-600">
              No quiz or questions found yet. Start by creating one!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default QuizManagementPage;
