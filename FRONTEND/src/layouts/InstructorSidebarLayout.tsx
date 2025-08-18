import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearInstructorDetails } from "../redux/slices/instructorSlice";
import { logout } from "../api/auth/InstructorAuthentication";

const navItems = [
  { name: "Dashboard", path: "/instructor/dashboard", icon: "📊" },
  { name: "Create Course", path: "/instructor/create-course", icon: "📚" },
  { name: "My Courses", path: "/instructor/courses", icon: "📖" },
  { name: "Slots", path: "/instructor/slots", icon: "📅" },
  { name: "Meetings", path: "/instructor/meetings", icon: "🎥" },
  { name: "Students", path: "/instructor/students", icon: "👥" },
  { name: "Analytics", path: "/instructor/analytics", icon: "📈" },
  { name: "Settings", path: "/instructor/profile", icon: "⚙️" },
];

const InstructorSidebarLayout = () => {
  const instructor = JSON.parse(localStorage.getItem("instructor") || "{}");
  const username = (instructor?.name || "Instructor").toUpperCase();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearInstructorDetails());
      toast.success("Logged out successfully");
      navigate("/instructor/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#1D2026" }}>
      {/* Sidebar */}
      <aside className="w-72 bg-[#252831] flex flex-col relative border-r border-[#333645] shadow-lg">
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-center border-b border-[#333645] bg-[#FF6636]/90">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-wide">
            SKILLzio 🎓
          </span>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-[#333645]">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#FF6636] shadow-md overflow-hidden flex items-center justify-center bg-gray-700">
              {instructor?.profilePicture ? (
                <img
                  src={instructor.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-white">👨‍🏫</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{username}</p>
              <p className="text-xs text-gray-400">Instructor</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xs text-gray-400 uppercase mb-6 tracking-widest font-semibold">
            Menu
          </h2>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-[#FF6636] text-white shadow-lg"
                      : "text-gray-300 hover:bg-[#FF6636]/20 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`text-xl transition-transform ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>

                    {/* Active glowing bar */}
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-1.5 bg-[#FF6636] rounded-r-lg shadow-md"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-[#333645]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-[#FF6636] bg-[#2C2F3A] hover:bg-[#FF6636]/20 py-2 px-4 rounded-lg transition duration-200"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto bg-[#2C2F3A] rounded-2xl shadow-lg p-8 min-h-[85vh] text-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorSidebarLayout;
