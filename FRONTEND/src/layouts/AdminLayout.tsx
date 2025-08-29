import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  TreePine,
  CreditCard,
  Crown,
  BadgePercent,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminLogout } from "../api/auth/AdminAuthentication";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.includes(path);

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard />, path: "dashboard" },
    { name: "Users", icon: <Users />, path: "users" },
    { name: "Instructors", icon: <GraduationCap />, path: "instructors" },
    { name: "Verification", icon: <ShieldCheck />, path: "verification" },
    { name: "Category", icon: <TreePine />, path: "category" },
    { name: "Courses", icon: <BookOpen />, path: "courses" },
    { name: "Membership", icon: <Crown />, path: "membership" },
    { name: "Order Management", icon: <ShoppingCart />, path: "orders" },
    { name: "Wallet", icon: <CreditCard />, path: "wallet" },
    { name: "Withdrawal", icon: <BadgePercent />, path: "withdrawal" },
  ];

  const handleLogout = async () => {
    try {
      const response = await adminLogout();
      if (response.success) {
        localStorage.removeItem("admin");
        toast.success("Logged out successfully");
        navigate("/admin/login");
      } else {
        toast.error(response.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="h-screen flex bg-[#111827] overflow-hidden">
      <style>{`
        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.4);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.7);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.4) transparent;
        }

        /* Responsive adjustments */
        @media (max-width: 1023px) {
          .mobile-sidebar {
            width: 280px !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .mobile-hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-5 left-5 z-50 lg:hidden bg-[#1f2937] p-3 rounded-full shadow-md hover:bg-[#22d3ee] transition-colors duration-300 border border-transparent hover:border-[#22d3ee]"
        aria-label="Toggle mobile menu"
      >
        <Menu size={22} className="text-[#d9f99d]" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-[#1e293b] via-[#111827] to-[#1e293b] shadow-xl rounded-tr-3xl rounded-br-3xl flex flex-col mobile-sidebar
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:h-full
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"}
          w-72 lg:w-auto
        `}
      >
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-cyan-800/50 flex-shrink-0 flex items-center justify-between relative">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center w-full" : "gap-3"
            }`}
          >
          
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-bold text-cyan-400 select-none">
                  SKILLzio
                </h1>
                <p className="text-cyan-300 text-xs font-medium select-none">
                  E-Learning Admin
                </p>
              </div>
            )}
          </div>

          {/* Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex bg-gray-900/30 hover:bg-gray-900/50 p-2 rounded-full transition-colors duration-200 items-center justify-center border border-cyan-500"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} className="text-cyan-400" />
            ) : (
              <ChevronLeft size={18} className="text-cyan-400" />
            )}
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-5 right-5 bg-gray-900/30 hover:bg-gray-900/50 p-2 rounded-full transition-colors duration-200 border border-cyan-500"
            aria-label="Close mobile menu"
          >
            <X size={18} className="text-cyan-400" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 p-3 lg:p-4 overflow-y-auto custom-scrollbar mobile-hide-scrollbar min-h-0">
          <nav className="space-y-1 lg:space-y-3">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={`/admin/${item.path}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center rounded-xl transition-all duration-250
                    ${
                      sidebarCollapsed
                        ? "justify-center px-3 py-4"
                        : "gap-4 px-4 py-3"
                    }
                    ${
                      active
                        ? "bg-cyan-600 bg-opacity-30 text-cyan-400 shadow-lg backdrop-blur-sm border border-cyan-400"
                        : "text-cyan-300 hover:text-cyan-400 hover:bg-gray-900/40"
                    }
                  `}
                  title={sidebarCollapsed ? item.name : ""}
                >
                  <span
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      active
                        ? "text-cyan-400"
                        : "text-cyan-300 group-hover:text-cyan-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="font-semibold text-base select-none">
                      {item.name}
                    </span>
                  )}
                  {sidebarCollapsed && (
                    <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-[#1e293b] text-cyan-400 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 select-none">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-cyan-800/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg transition duration-200
              ${
                sidebarCollapsed
                  ? "justify-center px-3 py-4"
                  : "gap-4 px-4 py-3"
              }
            `}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-semibold text-base select-none">
                Logout
              </span>
            )}
            {sidebarCollapsed && (
              <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-[#1e293b] text-pink-500 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 select-none">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close mobile menu overlay"
        />
      )}

      {/* Main */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar mobile-hide-scrollbar lg:ml-0">
        <div className="lg:hidden h-16 w-full" />
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
