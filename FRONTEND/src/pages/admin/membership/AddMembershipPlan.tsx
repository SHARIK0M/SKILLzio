import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import { createMembership } from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddMembershipPlan = () => {
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    durationInDays: "",
    price: "",
    description: "",
    benefits: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Plan name is required")
      .max(50, "Plan name must be under 50 characters")
      .matches(
        /^[A-Za-z][A-Za-z0-9\s&-]{2,}$/,
        "Plan name must start with a letter and contain only letters, numbers, spaces, hyphens or ampersands"
      )
      .test(
        "not-only-symbols-or-numbers",
        "Plan name cannot contain only numbers or symbols",
        (value) => !!value && /[A-Za-z]/.test(value)
      ),

    durationInDays: Yup.number()
      .typeError("Duration must be a number")
      .required("Duration is required")
      .min(30, "Minimum duration is 30 days"),

    price: Yup.number()
      .typeError("Price must be a number")
      .required("Price is required")
      .min(100, "Price must be at least ₹100"),

    description: Yup.string()
      .required("Description is required")
      .min(20, "Description should be at least 20 characters")
      .max(300, "Description should not exceed 300 characters")
      .matches(
        /^[A-Za-z\s]+$/,
        "Description must contain only letters and spaces"
      ),

    benefits: Yup.string()
      .required("At least one benefit is required")
      .test(
        "valid-benefits",
        "Each benefit must contain only letters and be at least 3 characters",
        (value) => {
          if (!value) return false;
          const benefits = value.split(",").map((b) => b.trim());
          return benefits.every((b) => /^[A-Za-z\s]{3,}$/.test(b));
        }
      ),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    try {
      const payload = {
        name: values.name,
        durationInDays: Number(values.durationInDays),
        price: Number(values.price),
        description: values.description || undefined,
        benefits: values.benefits
          ? values.benefits
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean)
          : [],
      };

      await createMembership(payload);
      toast.success("Membership plan created");
      resetForm();
      navigate("/admin/membership");
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Failed to create membership plan";
      if (message.includes("already exists")) {
        setFieldError("name", message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#111827] text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-14">
          <h2 className="text-3xl font-extrabold text-cyan-400">
            Create Membership Plan
          </h2>
          <p className="text-cyan-200 mt-1">
            Add a new membership plan to your platform
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#1e293b] rounded-3xl shadow-lg border border-cyan-700 p-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <InputField
                  name="name"
                  label="Plan Name"
                  placeholder="Enter plan name"
                
                />
                <InputField
                  name="durationInDays"
                  label="Duration (Days)"
                  type="number"
                  placeholder="e.g. 30"
              
                />
                <InputField
                  name="price"
                  label="Price (₹)"
                  type="number"
                  placeholder="e.g. 499"
                
                />
                <InputField
                  name="description"
                  label="Description"
                  placeholder="Enter description"
                  
                />
                <InputField
                  name="benefits"
                  label="Benefits (comma separated)"
                  placeholder="e.g. Access to premium courses, Priority support"
              
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-2xl text-white font-semibold transition ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create Plan"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddMembershipPlan;
