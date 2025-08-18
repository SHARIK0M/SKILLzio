import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearUserDetails } from "../redux/slices/userSlice";
import { logout } from "../api/auth/UserAuthentication";

const navItems = [
  { name: "Dashboard", path: "/user/dashboard", icon: "📊" },
  { name: "Courses", path: "/user/courses", icon: "📚" },
  { name: "Meetings", path: "/user/meetings", icon: "🎥" },
  { name: "Wishlist", path: "/user/wishlist", icon: "❤️" },
  { name: "Cart", path: "/user/cart", icon: "🛒" },
  { name: "Profile", path: "/user/profile", icon: "⚙️" },
];

const StudentSidebarLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = (user?.name || "Student").split(" ")[0]; // just first name

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
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col sticky top-0 h-screen">
        {/* Branding */}
        <div
          className="flex items-center justify-center h-20 border-b border-gray-100 cursor-pointer relative"
          onClick={() => navigate("/")}
        >
          <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent tracking-wide">
            SKILLzio 🎓
          </span>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 shadow-sm">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">👤</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{username}</p>
              <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                Learner
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xs text-gray-400 uppercase mb-4 tracking-widest font-semibold">
            Navigation
          </h2>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md scale-[1.02]"
                      : "text-gray-600 hover:bg-cyan-50 hover:text-emerald-600"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          {/* Motivational Message */}
          <div className="text-sm text-gray-500 italic">
            “Every day is a chance to learn something new ✨”
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentSidebarLayout;
