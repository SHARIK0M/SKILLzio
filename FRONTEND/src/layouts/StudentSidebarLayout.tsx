import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearUserDetails } from "../redux/slices/userSlice";
import { logout } from "../api/auth/UserAuthentication";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FiHome,
  FiBookOpen,
  FiVideo,
  FiMessageSquare,
  FiHeart,
  FiShoppingCart,
  FiClipboard,
  FiCreditCard,
  FiSettings,
} from "react-icons/fi";

const navItems = [
  { name: "Dashboard", path: "/user/dashboard", icon: <FiHome /> },
  { name: "Courses", path: "/user/courses", icon: <FiBookOpen /> },
  { name: "Meetings", path: "/user/meetings", icon: <FiVideo /> },
  { name: "Message", path: "/user/message", icon: <FiMessageSquare /> },
  { name: "Wishlist", path: "/user/wishlist", icon: <FiHeart /> },
  { name: "Cart", path: "/user/cart", icon: <FiShoppingCart /> },
  { name: "Purchase History", path: "/user/purchases", icon: <FiClipboard /> },
  { name: "Wallet", path: "/user/wallet", icon: <FiCreditCard /> },
  { name: "Settings", path: "/user/profile", icon: <FiSettings /> },
];
const StudentSideBar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearUserDetails());
      toast.success("See you soon 👋");
      navigate("/user/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Enhanced Profile Header */}
      <header className="relative bg-white shadow-xl border-b border-gray-100 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {/* Enhanced Profile Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-white shadow-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-0.5">
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {user?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
                </h2>
                <p className="text-gray-600 font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Web Designer & Lifelong Learner</span>
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center space-x-1">
                    <span>📚</span>
                    <span>12 Courses</span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center space-x-1">
                    <span>🏆</span>
                    <span>Level 5</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Logout Button */}
            <button
              onClick={handleLogout}
              className="group px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-semibold hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-200 hover:border-red-200"
            >
              <span className="flex items-center space-x-2">
                <span>Logout</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <nav className="relative border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <ul className="flex justify-center space-x-2 px-6 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <li key={item.name} className="flex-shrink-0">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative inline-flex items-center space-x-2 py-4 px-4 rounded-lg transition-all duration-300 font-medium text-sm whitespace-nowrap ${
                        isActive
                          ? "text-emerald-600 bg-emerald-50/80 shadow-md"
                          : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`text-lg transition-transform duration-300 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Enhanced Main Content */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="relative">
          {/* Background decoration for content area */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 -m-4"></div>
          <div className="relative p-4">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentSideBar;
