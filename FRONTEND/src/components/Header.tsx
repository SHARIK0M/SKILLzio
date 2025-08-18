import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "../api/auth/UserAuthentication";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { clearUserDetails } from "../redux/slices/userSlice";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearUserDetails());
      toast.success("Logged out successfully");
      navigate("/user/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

 return (
   <header className="bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-50">
     <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
       {/* Logo */}
       <div
         className="text-3xl font-extrabold tracking-wide text-[#49BBBD] cursor-pointer hover:opacity-80 transition"
         onClick={() => navigate("/")}
         aria-label="Go to homepage"
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
               aria-label={`Go to ${item}`}
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
       <div className="hidden md:flex items-center space-x-5 font-medium">
         {!user.email ? (
           <>
             <button
               onClick={() => navigate("/user/login")}
               className="px-5 py-2 rounded-xl border border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white transition"
               aria-label="Login"
             >
               Login
             </button>
             <button
               onClick={() => navigate("/enrollPage")}
               className="px-5 py-2 rounded-xl bg-[#49BBBD] text-white shadow-md hover:shadow-lg hover:bg-[#3aa3a6] transition"
               aria-label="Sign Up"
             >
               Sign Up
             </button>
           </>
         ) : (
           <>
             <button
               onClick={() => navigate("/user/cart")}
               className="hover:text-[#49BBBD] transition"
               aria-label="Cart"
             >
               Cart
             </button>
             <button
               onClick={() => navigate("/user/wishlist")}
               className="hover:text-[#49BBBD] transition"
               aria-label="Wishlist"
             >
               Wishlist
             </button>
             <div
               className="flex items-center gap-3 cursor-pointer hover:opacity-80"
               onClick={() => navigate("/user/dashboard")}
               role="button"
               aria-label="Go to Dashboard"
             >
               <img
                 src={user.profilePicture || "/default-avatar.png"}
                 alt={`${user.name}'s Profile`}
                 className="w-9 h-9 rounded-full border-2 border-[#49BBBD] object-cover"
               />
               <span className="text-gray-700">{user.name}</span>
             </div>
             <button
               onClick={handleLogout}
               className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
               aria-label="Logout"
             >
               Logout
             </button>
           </>
         )}
       </div>

       {/* Mobile Menu Button */}
       <div className="md:hidden">
         <button
           onClick={() => setIsOpen(!isOpen)}
           className="focus:outline-none text-gray-700"
           aria-label="Toggle menu"
           aria-expanded={isOpen}
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
               aria-label={`Go to ${item}`}
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
               aria-label="Login"
             >
               Login
             </button>
             <button
               onClick={() => {
                 setIsOpen(false);
                 navigate("/enrollPage");
               }}
               className="w-full px-5 py-2 rounded-xl bg-[#49BBBD] text-white hover:bg-[#3aa3a6] transition"
               aria-label="Sign Up"
             >
               Sign Up
             </button>
           </>
         ) : (
           <>
             <button
               onClick={() => {
                 setIsOpen(false);
                 navigate("/user/cart");
               }}
               className="block w-full text-left hover:text-[#49BBBD] transition"
               aria-label="Cart"
             >
               Cart
             </button>
             <button
               onClick={() => {
                 setIsOpen(false);
                 navigate("/user/wishlist");
               }}
               className="block w-full text-left hover:text-[#49BBBD] transition"
               aria-label="Wishlist"
             >
               Wishlist
             </button>
             <div
               className="flex items-center gap-3 mt-3 cursor-pointer hover:opacity-80"
               onClick={() => {
                 setIsOpen(false);
                 navigate("/user/dashboard");
               }}
               role="button"
               aria-label="Go to Dashboard"
             >
               <img
                 src={user.profilePicture || "/default-avatar.png"}
                 alt={`${user.name}'s Profile`}
                 className="w-9 h-9 rounded-full border-2 border-[#49BBBD] object-cover"
               />
               <span className="text-gray-700">{user.name}</span>
             </div>
             <button
               onClick={handleLogout}
               className="w-full px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition mt-2"
               aria-label="Logout"
             >
               Logout
             </button>
           </>
         )}
       </div>
     )}
   </header>
 );

};

export default Header;
