import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import StudentRouter from "./routes/studentRouter";
import InstructorRouter from "./routes/instructorRouter";
import AdminRouter from "./routes/adminRouter";


import StudentAuthValidator from "./components/studentComponent/StudentAuthValidator";
import InstructorAuthValidator from "./components/instructorComponent/InstructorAuthValidator";

const App = () => {
  const location = useLocation();

  // Determine which validator to use based on URL
  const isInstructorPath = location.pathname.startsWith("/instructor");
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      <ToastContainer />

      {!isAdminPath && (
        <>
          {isInstructorPath ? (
            <InstructorAuthValidator />
          ) : (
            <StudentAuthValidator />
          )}
        </>
      )}

      <Routes>
        <Route path="/*" element={<StudentRouter />} />
        <Route path="instructor/*" element={<InstructorRouter />} />
        <Route path="admin/*" element={<AdminRouter />} />
      </Routes>
    </>
  );
};

export default App;
