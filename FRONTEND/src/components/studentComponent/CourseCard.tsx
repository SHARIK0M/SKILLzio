import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addToCart,
  getCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
  courseAlreadyExistInWishlist,
} from "../../api/action/StudentAction";
import { Heart, ShoppingCart, XCircle } from "lucide-react";
import { isStudentLoggedIn } from "../../utils/auth";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  thumbnailUrl: string;
  categoryName?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  price,
  duration,
  level,
  thumbnailUrl,
}) => {
  const navigate = useNavigate();
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (!isStudentLoggedIn()) return;

    const fetchStatuses = async () => {
      try {
        const cartRes = await getCart();
        const existsInCart = cartRes?.data?.courses?.some(
          (c: any) => c._id === id
        );
        setIsInCart(existsInCart);

        const wishRes = await courseAlreadyExistInWishlist(id);
        setIsInWishlist(wishRes?.exists || false);
      } catch (err) {
        console.error("Failed to fetch cart/wishlist status:", err);
      }
    };

    fetchStatuses();
  }, [id]);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "from-green-500 to-emerald-500";
      case "intermediate":
        return "from-yellow-500 to-orange-500";
      case "advanced":
        return "from-red-500 to-pink-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-cyan-50/20 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Thumbnail Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Level badge */}
        {level && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 ${getLevelBg(
                level
              )} text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-white/20`}
            >
              {level}
            </span>
          </div>
        )}

        {/* Wishlist button overlay */}
        <div className="absolute top-4 right-4">
          <button
            onClick={async () => {
              try {
                if (!isStudentLoggedIn()) {
                  toast.info("Please log in to add wishlist");
                  return;
                }

                if (isInWishlist) {
                  const res = await removeFromWishlist(id);
                  toast.success(res.message || "Removed from wishlist");
                  setIsInWishlist(false);
                } else {
                  const res = await addToWishlist(id);
                  toast.success(res.message || "Added to wishlist");
                  setIsInWishlist(true);
                }
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Error");
              }
            }}
            className={`group/heart p-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 ${
              isInWishlist
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-600 hover:text-red-500"
            }`}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart
              size={18}
              fill={isInWishlist ? "currentColor" : "none"}
              className="transition-all duration-300"
            />
          </button>
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => navigate(`/user/course/${id}`)}
            className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-50 shadow-lg"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 flex flex-col flex-grow">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-emerald-700 text-xs font-semibold">
                {duration}h
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              ₹{price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 line-through">
              ₹{Math.round(price * 1.5).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-auto">
          {isInCart ? (
            <button
              onClick={async () => {
                try {
                  const res = await removeFromCart(id);
                  toast.success(res.message || "Removed from cart");
                  setIsInCart(false);
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || "Error");
                }
              }}
              className="flex-1 group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XCircle
                size={18}
                className="group-hover/btn:rotate-90 transition-transform duration-300"
              />
              <span>Remove from Cart</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  if (!isStudentLoggedIn()) {
                    toast.info("Please log in to add courses to cart");
                    return;
                  }
                  const res = await addToCart(id);
                  toast.success(res.message || "Added to cart");
                  setIsInCart(true);
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || "Error");
                }
              }}
              className="flex-1 group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingCart
                size={18}
                className="group-hover/btn:rotate-12 transition-transform duration-300"
              />
              <span>Add to Cart</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/user/course/${id}`)}
            className="group/details px-4 py-3 border-2 border-emerald-200 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 group-hover/details:rotate-45 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={`h-1 bg-gradient-to-r ${getLevelColor(
          level
        )} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
    </div>
  );
};

export default CourseCard;
