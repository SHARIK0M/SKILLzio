import { Types } from "mongoose";
import { IWishlist } from "../../../models/wishlist.Model";

export interface IStudentWishlistService {
  addToWishlist(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<IWishlist>;
  removeFromWishlist(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<void>;
  getWishlistCourses(userId: Types.ObjectId): Promise<IWishlist[]>;
  isCourseInWishlist(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<boolean>;
}
