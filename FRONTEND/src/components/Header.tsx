import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

// dummy profile
import DummyProfile from "../assets/dummy-profile.jpg";

// icons
import { Heart, ShoppingCart } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();


  const user = useSelector((state: RootState) => state.user);

  return (
    <header className="bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-3xl font-extrabold tracking-wide text-[#49BBBD] cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate("/")}
        >
          SKILLzio
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {["Home", "Courses", "Instructors", "About Us"].map((item, idx) => {
            const path =
              item === "Home"
                ? "/"
                : `/user/${item.toLowerCase().replace(/\s/g, "")}`;
            return (
              <button
                key={idx}
                onClick={() => navigate(path)}
                className="relative group"
              >
                <span className="group-hover:text-[#49BBBD] transition">
                  {item}
                </span>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#49BBBD] group-hover:w-full transition-all duration-300"></span>
              </button>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          {!user.email ? (
            <>
              <button
                onClick={() => navigate("/user/login")}
                className="px-5 py-2 rounded-xl border border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/enrollPage")}
                className="px-5 py-2 rounded-xl bg-[#49BBBD] text-white shadow-md hover:shadow-lg hover:bg-[#3aa3a6] transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {/* Wishlist */}
              <button
                onClick={() => navigate("/user/wishlist")}
                className="flex items-center gap-2 hover:text-[#49BBBD] transition"
              >
                <Heart size={18} /> <span>Wishlist</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/user/cart")}
                className="flex items-center gap-2 hover:text-[#49BBBD] transition"
              >
                <ShoppingCart size={18} /> <span>Cart</span>
              </button>

              {/* Profile */}
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                onClick={() => navigate("/user/dashboard")}
              >
                <img
                  src={user.profilePicture || DummyProfile}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-[#49BBBD] object-cover"
                />
                <span className="text-gray-700">{user.name || "Profile"}</span>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none text-gray-700"
          >
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
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-6 space-y-4 bg-white/90 backdrop-blur-lg border-t shadow-lg font-medium">
          {["Home", "Courses", "Instructors", "About Us"].map((item, idx) => {
            const path =
              item === "Home"
                ? "/"
                : `/user/${item.toLowerCase().replace(/\s/g, "")}`;
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(false);
                  navigate(path);
                }}
                className="block w-full text-left text-gray-700 hover:text-[#49BBBD] transition"
              >
                {item}
              </button>
            );
          })}

          {!user.email ? (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/user/login");
                }}
                className="w-full px-5 py-2 rounded-xl border border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white transition"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/enrollPage");
                }}
                className="w-full px-5 py-2 rounded-xl bg-[#49BBBD] text-white hover:bg-[#3aa3a6] transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/user/wishlist");
                }}
                className="flex items-center gap-2 hover:text-[#49BBBD] transition"
              >
                <Heart size={18} /> <span>Wishlist</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/user/cart");
                }}
                className="flex items-center gap-2 hover:text-[#49BBBD] transition"
              >
                <ShoppingCart size={18} /> <span>Cart</span>
              </button>

              <div
                className="flex items-center gap-3 mt-3 cursor-pointer hover:opacity-80"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/user/dashboard");
                }}
              >
                <img
                  src={user.profilePicture || DummyProfile}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-[#49BBBD] object-cover"
                />
                <span className="text-gray-700">{user.name || "Profile"}</span>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
