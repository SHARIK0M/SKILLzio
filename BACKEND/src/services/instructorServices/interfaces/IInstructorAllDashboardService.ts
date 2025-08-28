import { Types } from "mongoose";

export interface IInstructorAllCourseDashboardService {
  getInstructorDashboard(instructorId: Types.ObjectId): Promise<any>;
  getDetailedRevenueReport(
    instructorId: Types.ObjectId,
    range: "daily" | "weekly" | "monthly" | "yearly" | "custom",
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ data: any[]; total: number }>;
}