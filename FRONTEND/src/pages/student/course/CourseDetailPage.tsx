import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  courseDetail,
  getCart,
  addToCart,
  removeFromCart,
} from "../../../api/action/StudentAction";
import {
  addToWishlist,
  removeFromWishlist,
  courseAlreadyExistInWishlist,
} from "../../../api/action/StudentAction";
import { Heart } from "lucide-react";
import { isStudentLoggedIn } from "../../../utils/auth";

interface CourseDetail {
  _id: string;
  courseName: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  thumbnailUrl: string;
  demoVideo: {
    type: "video";
    url: string;
  };
  category: {
    _id: string;
    categoryName: string;
  };
  instructorId: {
    _id: string;
    username: string;
  };
}

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [chapterCount, setChapterCount] = useState(0);
  const [quizQuestionCount, setQuizQuestionCount] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseDetail(courseId!);
        const { course, chapterCount, quizQuestionCount } = res.data;

        setCourse(course);
        setChapterCount(chapterCount);
        setQuizQuestionCount(quizQuestionCount);

        if (isStudentLoggedIn()) {
          const cartRes = await getCart();
          const inCart = cartRes?.data?.courses?.some(
            (c: any) => c._id === courseId
          );
          setIsInCart(inCart);

          const wishRes = await courseAlreadyExistInWishlist(courseId!);
          setIsInWishlist(wishRes.exists);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchData();
  }, [courseId]);

  const handleCartToggle = async () => {
    if (!isStudentLoggedIn()) {
      toast.info("Please log in to manage your cart");
      return;
    }

    try {
      if (!courseId) return;

      if (isInCart) {
        await removeFromCart(courseId);
        toast.success("Course removed from cart");
        setIsInCart(false);
      } else {
        await addToCart(courseId);
        toast.success("Course added to cart");
        setIsInCart(true);
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("Course is already in cart");
        setIsInCart(true);
      } else {
        toast.error("Cart operation failed");
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!isStudentLoggedIn()) {
      toast.info("Please log in to manage your wishlist");
      return;
    }

    try {
      if (!courseId) return;

      if (isInWishlist) {
        await removeFromWishlist(courseId);
        toast.success("Removed from wishlist");
        setIsInWishlist(false);
      } else {
        await addToWishlist(courseId);
        toast.success("Added to wishlist");
        setIsInWishlist(true);
      }
    } catch (error: any) {
      toast.error("Wishlist operation failed");
      console.error(error);
    }
  };

  if (loading)
    return <div className="text-center py-20 text-gray-500">Loading...</div>;

  if (!course)
    return (
      <div className="text-center py-20 text-red-500">Course not found</div>
    );

  const getLevelBg = (level: string) => {
    switch (level.toLowerCase()) {
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

  const getLevelGradient = (level: string) => {
    switch (level.toLowerCase()) {
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans space-y-12">
      {/* Course Card */}
      <div className="relative bg-white shadow-lg rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-cyan-50/20 to-blue-50/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 relative z-10">
          {/* Thumbnail */}
          <div className="relative h-64 md:h-full overflow-hidden rounded-2xl shadow-md">
            <img
              src={course.thumbnailUrl}
              alt={course.courseName}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Course Info */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold text-gray-900">
                  {course.courseName}
                </h2>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-transform duration-300 hover:scale-110 ${
                    isInWishlist
                      ? "bg-red-500 text-white"
                      : "bg-white/90 text-gray-600 hover:text-red-500"
                  }`}
                  title={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    size={24}
                    fill={isInWishlist ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <p className="text-gray-700 mt-3">{course.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-gray-800 mt-6">
                <p>
                  <strong>Instructor:</strong> {course.instructorId.username}
                </p>
                <p>
                  <strong>Category:</strong> {course.category.categoryName}
                </p>
                <p>
                  <strong>Duration:</strong> {course.duration}
                </p>
                <p>
                  <strong>Level:</strong>{" "}
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${getLevelBg(
                      course.level
                    )}`}
                  >
                    {course.level}
                  </span>
                </p>
                <p>
                  <strong>Price:</strong> ₹{course.price}
                </p>
                <p>
                  <strong>Chapters:</strong> {chapterCount}
                </p>
                <p>
                  <strong>Quiz Questions:</strong> {quizQuestionCount}
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleCartToggle}
              className={`mt-6 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 bg-gradient-to-r ${
                isInCart
                  ? "from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  : "from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              }`}
            >
              {isInCart ? "Remove From Cart" : "Add To Cart"}
            </button>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div
          className={`h-1 bg-gradient-to-r ${getLevelGradient(
            course.level
          )} opacity-80`}
        ></div>
      </div>

      {/* Demo Video */}
      {course.demoVideo?.url && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            Watch Demo Video
          </h3>
          <video
            controls
            className="w-full rounded-2xl shadow-md max-h-[500px] object-cover"
            src={course.demoVideo.url}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
