import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import { addCategory } from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddCategoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
        Add New Category
      </h1>

      <Formik
        initialValues={{ name: "" }}
        validationSchema={Yup.object({
          name: Yup.string()
            .required("Category name is required")
            .test(
              "is-valid-category",
              "Must be at least 5 characters with alphabet letters (no only numbers/symbols)",
              (value) => {
                if (!value) return false;
                const trimmed = value.trim();
                const hasMinLength = trimmed.length >= 5;
                const hasLetters = /[a-zA-Z]/.test(trimmed);
                return hasMinLength && hasLetters;
              }
            ),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const response = await addCategory(values.name);
            if (response.success) {
              toast.success("Category added successfully");
              navigate("/admin/category");
            } else {
              toast.error(response.message || "Failed to add category");
            }
          } catch (err: any) {
            if (err?.response?.status === 409) {
              toast.error(
                err.response.data.message || "Category already exists"
              );
            } else {
              toast.error("Something went wrong");
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6 bg-[#1e293b] p-8 rounded-2xl shadow-lg border border-cyan-800/40">
            {/* Category Input */}
            <InputField
              name="name"
              label="Category Name"
              placeholder="Eg: Programming"
            
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-cyan-500 transition disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Category"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCategoryPage;
