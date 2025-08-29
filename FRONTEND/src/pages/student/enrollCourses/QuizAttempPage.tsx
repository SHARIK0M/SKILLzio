import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSpecificCourse,
  submitQuiz,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  title: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

const QuizAttemptPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getSpecificCourse(courseId!);
        const quizData = res?.enrollment?.courseId?.quizzes?.find(
          (q: Quiz) => q._id === quizId
        );
        if (!quizData) {
          toast.error("Quiz not found");
          navigate(`/user/enrolled`);
        } else {
          setQuiz(quizData);
        }
      } catch (err) {
        toast.error("Failed to load quiz");
        navigate(`/user/enrolled`);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, quizId, navigate]);

  const handleOptionChange = (qIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Validation: Ensure all questions are answered
    const unanswered = quiz.questions
      .map((_, idx) => idx)
      .filter((i) => !answers[i]);

    if (unanswered.length > 0) {
      const missed = unanswered.map((i) => `Q${i + 1}`).join(", ");
      toast.error(`Please answer the following question(s): ${missed}`);
      return;
    }

    const total = quiz.questions.length;
    let correct = 0;

    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correct += 1;
      }
    });

    const percentage = Math.round((correct / total) * 100);

    try {
      setSubmitting(true);
      await submitQuiz({
        courseId: courseId!,
        quizId: quizId!,
        totalQuestions: total,
        correctAnswers: correct,
        percentage,
      });

      toast.success(`Submitted! You scored ${percentage}%`);
      navigate(`/user/enrolled`);
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          <p className="text-gray-600 font-medium text-lg">Loading Quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="relative bg-white shadow-xl border-b border-gray-100 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
          <div className="relative flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {quiz.title}
            </h1>
            <button
              onClick={() => navigate(`/user/enrolled`)}
              className="group px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium hover:from-emerald-50 hover:to-cyan-100 hover:text-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:border-emerald-200"
            >
              <span className="flex items-center space-x-2">
                <span>← Back to Course</span>
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
          <div className="space-y-8">
            {quiz.questions.map((q, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <p className="font-semibold text-gray-700 mb-3 text-lg">
                  {index + 1}. {q.questionText}
                </p>
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center space-x-3 text-gray-600 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${index}`}
                        value={opt}
                        checked={answers[index] === opt}
                        onChange={() => handleOptionChange(index, opt)}
                        className="form-radio text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                      />
                      <span className="text-gray-600 hover:text-emerald-600 transition-colors duration-300">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="group px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                <span>{submitting ? "Submitting..." : "Submit Quiz"}</span>
                {!submitting && (
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
