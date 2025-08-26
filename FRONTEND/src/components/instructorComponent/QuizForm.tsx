import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


export interface SingleQuestionFormValues {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface Props {
  initialValues: SingleQuestionFormValues;
  onSubmit: (values: SingleQuestionFormValues) => void;
  buttonLabel?: string;
  formTitle?: string;
}

const strongTextRegex = /^(?!.*(.)\1{9,})(?=.*[a-zA-Z])(?=.*[\s\d]).{10,}$/;

const validationSchema = Yup.object().shape({
  questionText: Yup.string()
    .trim()
    .min(10, "Question must be at least 10 characters long")
    .matches(
      strongTextRegex,
      "Question must be meaningful (not just repeated letters)"
    )
    .required("Question text is required"),

  options: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(5, "Option must be at least 10 characters long")
        .matches(strongTextRegex, "Option must be meaningful")
        .required("Option is required")
    )
    .min(2, "At least 2 options are required"),

  correctAnswer: Yup.string()
    .trim()
    .min(5, "Correct answer must be at least 10 characters long")
    .matches(strongTextRegex, "Correct answer must be meaningful")
    .required("Correct answer is required"),
});

const SingleQuestionForm: React.FC<Props> = ({
  initialValues,
  onSubmit,
  buttonLabel = "Add Question",
  formTitle,
}) => {
  const isEditMode = buttonLabel === "Update Question";

  return (
    <div className="max-w-4xl mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form className="space-y-8">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">{isEditMode ? "✏️" : "📝"}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {formTitle ??
                    (isEditMode ? "Edit Question" : "Create New Question")}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {isEditMode
                    ? "Update your question details below"
                    : "Fill in the details to add a new question"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl space-y-8">
            {/* Question Section */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">❓</span>
                </div>
                <h3 className="text-lg font-bold text-white">Question Text</h3>
              </div>

              <div>
                <Field
                  name="questionText"
                  as="textarea"
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter your question here... Make it clear and specific."
                />
                <ErrorMessage
                  name="questionText"
                  component="div"
                  className="text-red-400 text-sm mt-2 font-medium"
                />
              </div>
            </div>

            {/* Options Section */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">📝</span>
                </div>
                <h3 className="text-lg font-bold text-white">Answer Options</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-orange-300 mb-2">
                      <span className="w-6 h-6 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-lg flex items-center justify-center mr-2 text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      Option {i + 1}
                    </label>
                    <Field
                      name={`options[${i}]`}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      placeholder={`Enter option ${i + 1}...`}
                    />
                    <ErrorMessage
                      name={`options[${i}]`}
                      component="div"
                      className="text-red-400 text-sm font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer Section */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">✅</span>
                </div>
                <h3 className="text-lg font-bold text-white">Correct Answer</h3>
              </div>

              <div>
                <Field
                  name="correctAnswer"
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter the correct answer..."
                />
                <ErrorMessage
                  name="correctAnswer"
                  component="div"
                  className="text-red-400 text-sm mt-2 font-medium"
                />
                <p className="text-green-300/60 text-xs mt-2">
                  💡 Tip: Make sure this matches exactly with one of your
                  options above
                </p>
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-500/20">
              <div className="flex items-center mb-3">
                <span className="text-orange-400 text-lg mr-2">💡</span>
                <h4 className="text-orange-300 font-semibold">
                  Question Guidelines
                </h4>
              </div>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Questions should be at least 10 characters long</li>
                <li>• Each option should be at least 5 characters long</li>
                <li>• Avoid repetitive or meaningless text</li>
                <li>
                  • Ensure the correct answer exactly matches one of the options
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center space-x-3"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {isEditMode ? "💾" : "➕"}
                </span>
                <span className="tracking-wide">
                  {buttonLabel.toUpperCase()}
                </span>
              </button>
            </div>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default SingleQuestionForm;
