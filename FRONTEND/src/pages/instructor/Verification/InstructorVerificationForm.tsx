import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import { sendVerification } from "../../../api/action/InstructorActionApi";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";

const InstructorVerificationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const instructor = useSelector((state: RootState) => state.instructor);

  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get("email") || "";

  const initialValues = {
    name: instructor?.name || "",
    email: instructor?.email || emailFromQuery || "",
    degreeCertificate: null,
    resume: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .required("Name is required")
      .trim(),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Enter a valid email format"
      )
      .trim()
      .lowercase()
      .required("Email is required"),
    degreeCertificate: Yup.mixed()
      .required("Degree Certificate is required")
      .test(
        "fileFormat",
        "Unsupported file format. Allowed: PDF, PNG, JPG, JPEG",
        (value) => {
          if (value) {
            const file = value as File; // <-- cast to File
            return [
              "application/pdf",
              "image/png",
              "image/jpg",
              "image/jpeg",
            ].includes(file.type);
          }
          return false;
        }
      ),

    resume: Yup.mixed()
      .required("Resume is required")
      .test(
        "fileFormat",
        "Unsupported file format. Allowed: PDF, DOC, DOCX",
        (value) => {
          if (value) {
            const file = value as File; // <-- cast to File
            return [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ].includes(file.type);
          }
          return false;
        }
      ),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.degreeCertificate) {
        formData.append("degreeCertificate", values.degreeCertificate);
      }
      if (values.resume) {
        formData.append("resume", values.resume);
      }

      const response = await sendVerification(formData);

      if (response) {
        toast.success("Verification request submitted successfully");
        navigate(`/instructor/verificationStatus/${values.email}`);
      }
    } catch (error) {
      toast.error("Error submitting verification request");
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {emailFromQuery || instructor?.email
          ? "Re-Verify Instructor Profile"
          : "Instructor Verification"}
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, errors, touched }) => (
          <Form>
            <InputField
              type="text"
              name="name"
              label="Name"
              placeholder="Enter your name"
              disabled={!!instructor?.name}
            />
            <div className="mt-5">
              <InputField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                disabled={!!instructor?.email || !!emailFromQuery}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="degreeCertificate"
                className="block text-sm font-semibold mb-1"
              >
                Degree Certificate
              </label>
              <input
                id="degreeCertificate"
                type="file"
                name="degreeCertificate"
                accept=".pdf,.png,.jpg,.jpeg"
                className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  if (e.currentTarget.files?.[0]) {
                    setFieldValue(
                      "degreeCertificate",
                      e.currentTarget.files[0]
                    );
                  }
                }}
              />
              {errors.degreeCertificate && touched.degreeCertificate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.degreeCertificate}
                </p>
              )}
              <small className="text-gray-500">
                Accepted formats: PDF, PNG, JPG, JPEG
              </small>
            </div>

            <div className="mt-5">
              <label
                htmlFor="resume"
                className="block text-sm font-semibold mb-1"
              >
                Resume
              </label>
              <input
                id="resume"
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  if (e.currentTarget.files?.[0]) {
                    setFieldValue("resume", e.currentTarget.files[0]);
                  }
                }}
              />
              {errors.resume && touched.resume && (
                <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
              )}
              <small className="text-gray-500">
                Accepted formats: PDF, DOC, DOCX
              </small>
            </div>

            <div className="mt-8 text-center">
              {isSubmitting ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 bg-gray-500 text-white font-semibold py-2 px-8 rounded opacity-70 cursor-not-allowed"
                >
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Submitting...
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded transition"
                >
                  Submit Verification
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default InstructorVerificationForm;
