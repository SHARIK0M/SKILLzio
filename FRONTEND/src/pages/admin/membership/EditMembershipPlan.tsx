import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../../../components/common/InputField";
import {
  getMembershipById,
  editMembership,
} from "../../../api/action/AdminActionApi";
import { toast } from "react-toastify";

interface FormValues {
  name: string;
  durationInDays: string;
  price: string;
  description?: string;
  benefits?: string;
}

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

const EditMembershipPlanPage = () => {
  const { membershipId } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    try {
      if (!membershipId) return;
      const response = await getMembershipById(membershipId);
      const plan = response.plan;
      setInitialValues({
        name: plan.name,
        durationInDays: plan.durationInDays.toString(),
        price: plan.price.toString(),
        description: plan.description || "",
        benefits: (plan.benefits || []).join(", "),
      });
    } catch (err) {
      toast.error("Failed to load membership plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [membershipId]);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      if (!membershipId) return;
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
      await editMembership(membershipId, payload);
      toast.success("Membership plan updated");
      navigate("/admin/membership");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update membership plan";
      if (
        message.includes("already exists") ||
        err?.response?.data?.error?.includes("already exists")
      ) {
        setFieldError("name", err?.response?.data?.error || message);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-cyan-400">
        Loading membership plan...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#111827] text-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-14">
          <h2 className="text-3xl font-extrabold text-cyan-400">
            Edit Membership Plan
          </h2>
          <p className="text-cyan-200 mt-1">
            Update details of your membership plan
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#1e293b] rounded-3xl shadow-lg border border-cyan-700 p-8">
          <Formik
            initialValues={initialValues}
            enableReinitialize
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
                  {isSubmitting ? "Updating..." : "Update Plan"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditMembershipPlanPage;
