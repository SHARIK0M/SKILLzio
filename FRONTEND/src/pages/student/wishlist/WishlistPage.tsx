import { useEffect, useState } from "react";
import {
  getWishlist,
  removeFromWishlist,
  addToCart,
  getCart,
} from "../../../api/action/StudentAction";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Course {
  _id: string;
  courseName: string;
  thumbnailUrl: string;
  price: number;
}

interface WishlistItem {
  _id: string;
  courseId: Course | null;
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cartCourseIds, setCartCourseIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
    fetchCartItems();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await getWishlist();
      const validItems = response.data.filter(
        (item: WishlistItem) => item.courseId !== null
      );
      setWishlist(validItems);
    } catch (error) {
      toast.error("Failed to fetch wishlist");
    }
  };

  const fetchCartItems = async () => {
    try {
      const cart = await getCart();
      if (cart?.data?.courses) {
        const ids = cart.data.courses.map((c: any) => c._id);
        setCartCourseIds(ids);
      }
    } catch (error) {
      toast.error("Failed to fetch cart");
    }
  };

  const handleRemoveFromWishlist = async (courseId: string) => {
    try {
      await removeFromWishlist(courseId);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  const toggleCart = async (courseId: string) => {
    try {
      if (cartCourseIds.includes(courseId)) {
        await addToCart(courseId); // If already in cart, keep it consistent with your logic
        toast.success("Added to cart");
      } else {
        await addToCart(courseId);
        toast.success("Added to cart");
      }
      fetchCartItems();
    } catch (error) {
      toast.error("Cart operation failed");
    }
  };

  const totalPrice = wishlist.reduce(
    (sum, item) => sum + (item.courseId?.price || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header Section */}
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>

        <div className="relative p-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">❤️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Your Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlist.length === 0
                  ? "Your wishlist is empty"
                  : `${wishlist.length} course${
                      wishlist.length > 1 ? "s" : ""
                    } in your wishlist`}
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                ₹{totalPrice.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty Wishlist */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-6xl">😔</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Your wishlist feels lonely!
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Discover amazing courses and add them to your wishlist to start your
            learning journey.
          </p>
          <button
            onClick={() => navigate("/user/courses")}
            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
          >
            Explore Courses
          </button>
        </div>
      ) : (
        <>
          {/* Wishlist Items */}
          <div className="space-y-4">
            {wishlist.map((item, index) => {
              const course = item.courseId!;
              const isInCart = cartCourseIds.includes(course._id);

              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-cyan-50/20 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative p-6 flex items-center space-x-6">
                    {/* Course Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {index + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.courseName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Premium Course • Lifetime Access
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex-shrink-0 text-right space-y-3">
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{course.price.toLocaleString()}
                      </p>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => toggleCart(course._id)}
                          className={`px-4 py-2 rounded-xl text-white font-medium shadow-sm hover:shadow-lg transform hover:scale-105 ${
                            isInCart ? "bg-red-500" : "bg-green-600"
                          }`}
                        >
                          {isInCart ? "Remove from Cart" : "Add to Cart"}
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(course._id)}
                          className="px-4 py-2 rounded-xl bg-gray-300 text-black font-medium hover:bg-gray-400 transition-all duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Why Choose Our Courses?
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <h4 className="font-semibold text-emerald-700 mb-1">
                  Lifetime Access
                </h4>
                <p className="text-sm text-emerald-600">
                  Learn at your own pace
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-700 mb-1">
                  Certificate
                </h4>
                <p className="text-sm text-blue-600">Get certified</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-purple-700 mb-1">
                  Expert Support
                </h4>
                <p className="text-sm text-purple-600">24/7 assistance</p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-orange-700 mb-1">
                  Mobile App
                </h4>
                <p className="text-sm text-orange-600">Learn anywhere</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
