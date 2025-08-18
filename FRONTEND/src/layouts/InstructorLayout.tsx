import InstructorHeader from "../components/instructorComponent/InstructorHeader";
import { Outlet } from "react-router-dom";

const InstructorLayout = () => {
  return (
    <>
      <InstructorHeader />
      <Outlet />
    </>
  );
};

export default InstructorLayout;
