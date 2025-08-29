import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../../components/common/InputField";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import {
  instructorGetProfile,
  instructorUpdatePassword,
  instructorUpdateBankDetail,
} from "../../../api/action/InstructorActionApi";
import { setInstructor } from "../../../redux/slices/instructorSlice";

const InstructorProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await instructorGetProfile();
        console.log("response from profilepage instructor", response);
        if (response.success) {
          dispatch(
            setInstructor({
              userId: response.data._id,
              name: response.data.username,
              email: response.data.email,
              role: response.data.role,
              isBlocked: response.data.isBlocked,
              isVerified: response.data.isVerified,
              profilePicture: response.data.profilePicUrl || null,
            })
          );
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to load instructor profile", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-300 text-lg font-semibold">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧑‍🏫</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Instructor Profile
              </h2>
              <p className="text-gray-400 text-sm">
                Manage your profile information
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative mb-6">
                {profile.profilePicUrl ? (
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-lg">
                    <img
                      src={profile.profilePicUrl}
                      alt="Instructor Profile"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600/50">
                    <span className="text-5xl">👨‍🏫</span>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2">
                  {profile.isVerified ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                      <span className="text-white text-xs">⏳</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 w-full lg:w-auto">
                <button
                  onClick={() =>
                    (window.location.href = "/instructor/editProfile")
                  }
                  className="w-full lg:w-48 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                >
                  ✏️ Edit Profile
                </button>

                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full lg:w-48 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🔒 {showPasswordForm ? "Cancel" : "Change Password"}
                </button>

                <button
                  onClick={() => setShowBankForm(!showBankForm)}
                  className="w-full lg:w-48 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🏦 {showBankForm ? "Cancel" : "Bank Details"}
                </button>
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    Basic Information
                  </h3>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Username
                      </p>
                      <p className="text-white font-semibold text-lg">
                        {profile.username}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-white font-semibold">
                        {profile.email}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Status
                      </p>
                      <p className="text-white font-semibold flex items-center">
                        {profile.isVerified ? (
                          <>
                            <span className="text-green-400 mr-2">✅</span>
                            Verified
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400 mr-2">⏳</span>
                            Not Verified
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Professional Details
                  </h3>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Skills
                      </p>
                      <p className="text-white font-semibold">
                        {profile.skills?.join(", ") || "None specified"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Expertise
                      </p>
                      <p className="text-white font-semibold">
                        {profile.expertise?.join(", ") || "None specified"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Mentor Status
                      </p>
                      <p className="text-white font-semibold flex items-center">
                        {profile.isMentor ? (
                          <>
                            <span className="text-green-400 mr-2">✅</span>
                            Active Mentor
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 mr-2">➖</span>
                            Not a Mentor
                          </>
                        )}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Bank Status
                      </p>
                      <p className="text-white font-semibold flex items-center">
                        {profile.bankAccount?.accountNumber ? (
                          <>
                            <span className="text-green-400 mr-2">🏦</span>
                            Linked
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400 mr-2">⚠️</span>
                            Not Linked
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Change Password
                </h2>
                <p className="text-gray-400 text-sm">
                  Update your account password
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Formik
              initialValues={{
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={Yup.object({
                currentPassword: Yup.string().required(
                  "Current password is required"
                ),
                newPassword: Yup.string()
                  .required("New password is required")
                  .min(6, "Password must be at least 6 characters")
                  .matches(
                    /[A-Z]/,
                    "Must contain at least one uppercase letter"
                  )
                  .matches(
                    /[a-z]/,
                    "Must contain at least one lowercase letter"
                  )
                  .matches(/[0-9]/, "Must contain at least one number")
                  .matches(
                    /[!@#$%^&*(),.?":{}|<>]/,
                    "Must contain at least one special character"
                  ),
                confirmPassword: Yup.string()
                  .oneOf([Yup.ref("newPassword")], "Passwords must match")
                  .required("Confirm your new password"),
              })}
              onSubmit={async (values, { resetForm }) => {
                try {
                  const res = await instructorUpdatePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                  });

                  if (res.success) {
                    toast.success("Password updated successfully");
                    resetForm();
                    setShowPasswordForm(false);
                  } else {
                    toast.error(res.message || "Password update failed");
                  }
                } catch (error) {
                  toast.error("Something went wrong");
                }
              }}
            >
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="currentPassword"
                      type="password"
                      label="Current Password"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="newPassword"
                      type="password"
                      label="New Password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="confirmPassword"
                      type="password"
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                  >
                    🔄 Update Password
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}

      {/* Bank Details Form */}
      {showBankForm && (
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏦</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Update Bank Details
                </h2>
                <p className="text-gray-400 text-sm">
                  Manage your banking information
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Formik
              initialValues={{
                accountHolderName: "",
                accountNumber: "",
                ifscCode: "",
                bankName: "",
              }}
              validationSchema={Yup.object({
                accountHolderName: Yup.string()
                  .required("Account holder name is required")
                  .matches(
                    /^[a-zA-Z\s]+$/,
                    "Only letters and spaces are allowed"
                  ),
                accountNumber: Yup.string()
                  .required("Account number is required")
                  .matches(/^\d{9,18}$/, "Account number must be 9-18 digits"),
                ifscCode: Yup.string()
                  .required("IFSC code is required")
                  .matches(
                    /^[A-Z]{4}0[A-Z0-9]{6}$/,
                    "Invalid IFSC code format"
                  ),
                bankName: Yup.string()
                  .required("Bank name is required")
                  .matches(
                    /^[a-zA-Z\s]+$/,
                    "Only letters and spaces are allowed"
                  ),
              })}
              onSubmit={async (values, { resetForm }) => {
                try {
                  const res = await instructorUpdateBankDetail(values);

                  if (res.success) {
                    toast.success("Bank details updated successfully");
                    setProfile(res.data); // Update profile with new bank details
                    resetForm();
                    setShowBankForm(false);
                  } else {
                    toast.error(res.message || "Bank details update failed");
                  }
                } catch (error) {
                  toast.error("Something went wrong");
                }
              }}
            >
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="accountHolderName"
                      type="text"
                      label="Account Holder Name"
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="accountNumber"
                      type="text"
                      label="Account Number"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="ifscCode"
                      type="text"
                      label="IFSC Code"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-xl border border-gray-600/30">
                    <InputField
                      name="bankName"
                      type="text"
                      label="Bank Name"
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                  >
                    💾 Update Bank Details
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorProfilePage;
