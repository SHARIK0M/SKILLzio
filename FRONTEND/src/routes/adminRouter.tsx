import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/admin/Auth/login";
import Home from "../pages/admin/Home";
import AdminLayout from "../layouts/AdminLayout";
import AdminSessionRoute from "../protector/AdminSessionRoute"; 
import PrivateRoute from "../protector/AdminPrivateRoute";

// Pages
import UserList from "../pages/admin/userList/UserList";
import InstructorList from "../pages/admin/instructorList/InstructorList";
import VerificationPage from "../pages/admin/verification/VerificationPage";
import VerificationDetailsPage from "../pages/admin/verification/VerificationDetailPage";

import AdminCategoryListPage from "../pages/admin/category/AdminCategoryList";
import AddCategoryPage from "../pages/admin/category/AddCategoryPage";
import EditCategoryPage from "../pages/admin/category/EditCategory";

import AdminCourseManagementPage from "../pages/admin/course/AdminCourseManagementPage";
import AdminCourseDetailPage from "../pages/admin/course/AdminCourseDetailPage";
import AdminWalletPage from "../pages/admin/wallet/AdminWalletPage";
import Withdrawal from "../pages/admin/withdrawal/Withdrawal";
import WithdrawalDetailsPage from "../pages/admin/withdrawal/WithdrawalDetails";


import MembershipPlanPage from "../pages/admin/membership/MembershipPlanPage";
import AddMembershipPlan from "../pages/admin/membership/AddMembershipPlan";
import EditMembershipPlanPage from "../pages/admin/membership/EditMembershipPlan";
import Orders from "../pages/admin/purchaseHistory/Orders";
import MembershipOrderDetail from "../pages/admin/purchaseHistory/MembershipOrderDetail";

const AdminRouter = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="login"
        element={
          <AdminSessionRoute>
            <LoginPage />
          </AdminSessionRoute>
        }
      />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="users" element={<UserList />} />
          <Route path="instructors" element={<InstructorList />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route
            path="verificationDetail/:email"
            element={<VerificationDetailsPage />}
          />
          {/* Category Routes */}
          <Route path="category" element={<AdminCategoryListPage />} />
          <Route path="addCategory" element={<AddCategoryPage />} />
          <Route
            path="category/edit/:categoryId"
            element={<EditCategoryPage />}
          />
          {/* Course Routes */}
          <Route path="courses" element={<AdminCourseManagementPage />} />
          <Route path="courses/:courseId" element={<AdminCourseDetailPage />} />
          {/* wallet  */}
          <Route path="wallet" element={<AdminWalletPage />} />
          {/* withdrawal request */}
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route
            path="withdrawals/:requestId"
            element={<WithdrawalDetailsPage />}
          />
          {/* membership */}
          <Route path="membership" element={<MembershipPlanPage />} />
          <Route path="membership/add" element={<AddMembershipPlan />} />
          <Route
            path="membership/edit/:membershipId"
            element={<EditMembershipPlanPage />}
          />

          {/* purchase history */}
          <Route path="orders" element={<Orders />} />
          <Route
            path="membershipPurchase/:txnId"
            element={<MembershipOrderDetail />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRouter;
