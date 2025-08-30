import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPath = () => {
    const path = location.pathname.toLowerCase();

    if (path.startsWith("/user")) return "/user/dashboard"; // student
    if (path.startsWith("/instructor")) return "/instructor/dashboard"; // instructor
    if (path.startsWith("/admin")) return "/admin/dashboard"; // admin
    return "/"; // default (landing)
  };

  const handleRedirect = () => {
    const path = getRedirectPath();
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-center px-6">
      <h1 className="text-7xl font-extrabold mb-4 text-[#49bbbd] drop-shadow-lg animate-pulse">
        404
      </h1>
      <h2 className="text-3xl font-semibold mb-3 text-gray-200">
        Page Not Found
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Oops! The page you're looking for doesn’t exist or has been moved.
      </p>
      <button
        onClick={handleRedirect}
        className="px-6 py-3 rounded-2xl bg-[#49bbbd] text-black font-semibold shadow-md hover:shadow-[#49bbbd]/50 hover:scale-105 transform transition duration-300"
      >
        🚀 Go to Home
      </button>
    </div>
  );
};

export default NotFound;
