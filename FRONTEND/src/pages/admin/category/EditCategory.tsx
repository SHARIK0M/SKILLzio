import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import {
  getCategoryById,
  editCategory,
} from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";

const EditCategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getCategoryById(categoryId!);

        if (response?.success && response?.data) {
          setInitialValues({ name: response.data.categoryName });
        } else {
          toast.error(response?.data?.message);
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-cyan-400 mb-6 tracking-wide">
        Edit Category
      </h1>

      {loading ? (
        <p className="text-gray-300">Loading category details...</p>
      ) : (
        <Formik
          enableReinitialize
          initialValues={initialValues}
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
              const response = await editCategory(categoryId!, values.name);
              if (response.success) {
                toast.success("Category updated successfully");
                navigate("/admin/category");
              } else {
                toast.error(response.message || "Failed to update category");
              }
            } catch (err: any) {
              const message = err?.response?.data?.message;
              toast.error(message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6 bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-cyan-800/40">
              <InputField
                name="name"
                label="Category Name"
                placeholder="Eg: Web Development"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-600 text-white px-6 py-3 rounded-xl 
                           hover:bg-cyan-500 transition disabled:opacity-50
                           shadow-md shadow-cyan-900/50"
              >
                {isSubmitting ? "Updating..." : "Update Category"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default EditCategoryPage;
