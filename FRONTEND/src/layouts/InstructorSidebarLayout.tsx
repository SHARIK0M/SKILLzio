import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearInstructorDetails } from "../redux/slices/instructorSlice";
import { logout } from "../api/auth/InstructorAuthentication";

const navItems = [
  {
    name: "Dashboard",
    path: "/instructor/dashboard",
    icon: "📊",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "Create Course",
    path: "/instructor/createCourse",
    icon: "📚",
    gradient: "from-orange-400 to-orange-500",
  },
  {
    name: "My Courses",
    path: "/instructor/courses",
    icon: "📖",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Slots",
    path: "/instructor/slots",
    icon: "📅",
    gradient: "from-orange-400 to-yellow-500",
  },
  {
    name: "Memberships",
    path: "/instructor/membership",
    icon: "👥",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "PurchaseHistory",
    path: "/instructor/purchaseHistory",
    icon: "🧾",
    gradient: "from-orange-400 to-orange-500",
  },
  {
    name: "Wallet",
    path: "/instructor/wallet",
    icon: "📈",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Settings",
    path: "/instructor/profile",
    icon: "⚙️",
    gradient: "from-gray-500 to-gray-600",
  },
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl flex flex-col relative border-r border-gray-700/50 shadow-2xl z-10">
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

        {/* Brand Header */}
        <div className="h-24 flex items-center justify-center border-b border-gray-700/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10"></div>
          <div className="relative z-10 text-center">
            <span className="text-4xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
              SKILLzio
            </span>
            <div className="text-xs text-orange-300/80 font-medium tracking-widest mt-1">
              INSTRUCTOR PORTAL
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-lg">
                <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-gray-700">
                  {instructor?.profilePicture ? (
                    <img
                      src={instructor.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👨‍🏫</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-lg">{username}</p>
              <p className="text-sm text-orange-300/80 font-medium">
                Professional Instructor
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>



        {/* Navigation */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Navigation
            </h2>
            <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
          </div>

          <nav className="flex flex-col space-y-3">
            {navItems.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative group flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ease-out transform hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-orange-500/25`
                      : "text-gray-300 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/10 hover:text-white hover:shadow-lg hover:shadow-orange-500/10"
                  }`
                }
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {({ isActive }) => (
                  <>
                    {/* Glow effect for active item */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-orange-600/20 blur-xl"></div>
                    )}

                    <div
                      className={`relative z-10 text-2xl transition-all duration-300 ${
                        isActive
                          ? "scale-110 drop-shadow-lg"
                          : "group-hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <span className="relative z-10 font-semibold text-sm tracking-wide">
                      {item.name}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <>
                        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 w-1 bg-white rounded-r-full shadow-lg"></span>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </>
                    )}

                    {/* Hover indicator */}
                    <div
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-100 bg-orange-400"
                      }`}
                    ></div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-gray-700/30">
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-orange-400">💡</span>
              <span className="text-orange-300 font-semibold text-sm">
                Quick Tip
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Use analytics to track student engagement and improve your
              courses!
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 text-sm font-bold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-orange-500 hover:to-orange-600 py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 group"
          >
            <span className="text-xl transition-transform group-hover:scale-110">
              🚪
            </span>
            <span className="tracking-wide">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Welcome back, {instructor?.name || "Instructor"}!
                </h1>
                <p className="text-gray-400 mt-2">
                  Ready to inspire and educate today?
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 min-h-[75vh] text-white border border-gray-700/30">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorSidebarLayout;
