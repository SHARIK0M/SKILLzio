const AdminRoutersEndPoints = {
  //user block or unblock
  adminGetUsers: "/api/admin/getAllUsers",
  adminBlockUser: "/api/admin/blockUser",
  //instructor block or unblock
  adminGetInstructors: "/api/admin/getAllInstructors",
  adminBlockInstructor: "/api/admin/blockInstructor",
  //verification
  adminGetVerifcationsRequest: "/api/admin/requests",
  adminGetVerificationByEamil: "/api/admin/request",
  adminApproveVerification: "/api/admin/approveRequest",

};

export default AdminRoutersEndPoints;
