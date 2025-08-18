import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { logout } from "../../api/auth/InstructorAuthentication";
import { clearInstructorDetails } from "../../redux/slices/instructorSlice";

const InstructorHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const instructor = useSelector((state: RootState) => state.instructor);

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
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <h1
            className="text-2xl font-bold cursor-pointer tracking-wide hover:opacity-90"
            onClick={() => navigate("/")}
          >
            🎓 Instructor
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 font-medium">
            {!instructor.email ? (
              <>
                <button
                  onClick={() => navigate("/instructor/login")}
                  className="hover:text-rose-200 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/instructor/signUp")}
                  className="px-5 py-2 rounded-xl bg-white text-indigo-600 font-semibold shadow-md hover:bg-indigo-50 transition"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <div
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-90"
                  onClick={() => setProfileMenu(!profileMenu)}
                >
                  <img
                    src={instructor.profilePicture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <span>{instructor.name}</span>
                  <svg
                    className={`w-4 h-4 transform transition ${
                      profileMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Dropdown */}
                {profileMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white text-gray-800 rounded-xl shadow-lg py-2 animate-fade-in">
                    <button
                      onClick={() => {
                        navigate("/instructor/dashboard");
                        setProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="focus:outline-none"
            >
              {isOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-80" : "max-h-0"
          }`}
        >
          <div className="bg-white text-gray-800 rounded-b-2xl shadow-md py-4 space-y-2">
            {!instructor.email ? (
              <>
                <button
                  onClick={() => {
                    navigate("/instructor/login");
                    setIsOpen(false);
                  }}
                  className="block w-full px-6 py-2 text-left hover:bg-gray-100"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/instructor/signUp");
                    setIsOpen(false);
                  }}
                  className="block w-full px-6 py-2 text-left font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/instructor/dashboard");
                    setIsOpen(false);
                  }}
                  className="block w-full px-6 py-2 text-left hover:bg-gray-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full px-6 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </>
  );
};

export default InstructorHeader;
