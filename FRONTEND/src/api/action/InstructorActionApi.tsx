import InstructorRouterEndPoints from "../../types/EndPoints/instructor.Endpoints";
import { API } from "../../service/axios";
import {
  type IQuestionPayload,
  type ICreateQuizPayload,
} from "../../types/interface/IQuiz";
import fileDownload from "js-file-download";
import { type FetchCoursesParams } from "../../types/interface/IFetchCoursesParam";


// Send a verification request with form data (e.g., documents, info)
export const sendVerification = async (formData: FormData) => {
  try {
    // POST request to send verification request with multipart/form-data
    const response = await API.post(
      InstructorRouterEndPoints.instructorSendVerificationRequest,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
        withCredentials: true, // Include cookies for auth
      }
    );
    console.log("sendVerification request", response.data);
    return response.data; // Return server response (e.g., success message)
  } catch (error) {
    console.log(error); // Log error if request fails
  }
};

// Get verification request details/status by instructor email
export const getVerificationRequestByemail = async (email: string) => {
  try {
    // GET request to fetch verification status/details by email
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorGetVerificationStatus}/${email}`,
      {
        withCredentials: true, // Include cookies for auth
      }
    );

    console.log("instructorVerification detail", response.data);
    return response.data; // Return verification details from server
  } catch (error) {
    throw error; // Propagate error for handling outside
  }
};


//profile management api call

export const instructorGetProfile = async() =>{
    try {
        const response = await API.get(InstructorRouterEndPoints.instructorProfilePage,{
            withCredentials:true
        })
    
        console.log('instructor profile data response',response.data)

        return response.data
    } catch (error:any) {
        if(error.response && error.response.data){
            return error.response.data
        }
    }
}

export const instructorUpdateProfile = async(formData:FormData):Promise<any> => {
    try {
        const response = await API.put(InstructorRouterEndPoints.instructorUpdateProfile,formData,{
            headers:{"Content-Type":"multipart/form-data"},
            withCredentials:true
        })

        console.log('instructor updateprofile response',response.data)

        return response.data
    } catch (error) {
        throw error
    }
}

export const instructorUpdatePassword = async(data:any):Promise<any>=>{
    try {
        const response = await API.put(InstructorRouterEndPoints.instructorUpdatePassword,data,{
            withCredentials:true
        })

        console.log('instructor password updation data',response.data)

        return response.data
    } catch (error:any) {
        if(error.response && error.response.data){
            return error.response.data
        }
    }
}


//FETCH CATEGORY

export const getInstructorCategories = async (): Promise<any[]> => {
    try {
        const response = await API.get("/api/instructor/categories", {
          withCredentials: true,
        });
        return response.data.data;    
    } catch (error) {
        throw error
    }
};

//course management actions

export const instructorCreateCourse = async (formData: FormData): Promise<any> => {
    try {
        const response = await API.post(InstructorRouterEndPoints.instructorCreateCourse,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            },
            withCredentials:true
          }
        );
        return response.data;    
    } catch (error) {
        throw error
    }
};

// Update Course
export const instructorUpdateCourse = async (
  courseId: string,
  formData: FormData
): Promise<any> => {
    try {
        const response = await API.put(`${InstructorRouterEndPoints.instructorUpdateCourse}/${courseId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials:true
          }
        );
        return response.data;
    } catch (error) {
        throw error
    }
};

// Delete Course
export const instructorDeleteCourse = async (courseId: string): Promise<any> => {
    try {
        const response = await API.delete(
          `${InstructorRouterEndPoints.instructorDeleteCourse}/${courseId}`,{
              withCredentials:true
          }
        );
        return response.data;    
    } catch (error) {
        throw error
    }
};

// Get Course By ID
export const instructorGetCourseById = async (courseId: string): Promise<any> => {
    try {
        const response = await API.get(`${InstructorRouterEndPoints.instructorGetCourseById}/${courseId}`,{
          withCredentials:true
        }
        );
        return response.data;   
    } catch (error) {
        throw error
    }
};

export const fetchInstructorCourses = async (params: FetchCoursesParams = {}) => {
  try {
    const response = await API.get(
      InstructorRouterEndPoints.instructorGetCreatedCourses,
      {
        params, // ✅ pass page, limit, search as query params
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//chapter related actions

export const getChaptersByCourse = async (
  courseId: string,
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorGetChaptersByCourse}/${courseId}`,
      {
        params: { page, limit, search },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChapterById = async (courseId:string,chapterId:string)=>{
    try {
        const response = await API.get(`${InstructorRouterEndPoints.instructorGetSingleChapter}/${courseId}/${chapterId}`)

        console.log('get chapter by id',response.data)
        return response.data.data
    } catch (error) {
        throw error
    }
}

export const createChapter = async (courseId: string, formData: FormData) => {
    try {
      const response = await API.post(`${InstructorRouterEndPoints.instructorCreateChapter}/${courseId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('create Chapter',response.data)
      return response.data.data;
  } catch (error) {
    throw error
  }
};

export const updateChapter = async (courseId: string,chapterId: string,formData: FormData) => {
    try {
        const response = await API.put(`${InstructorRouterEndPoints.instructorUpdateChapter}/${courseId}/${chapterId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log('update chapter',response.data)
        return response.data.data;
    } catch (error) {
        throw error
    }
};

export const deleteChapter = async (courseId: string, chapterId: string) => {
    try {
        const response = await API.delete(`${InstructorRouterEndPoints.instructorDeleteChapter}/${courseId}/${chapterId}`);
        return response.data;
    } catch (error) {
        throw error
    }
};


//quiz related actions

export const createQuiz = async (quizData: ICreateQuizPayload) => {
  try {
    const response = await API.post(
      InstructorRouterEndPoints.instructorCreateQuiz,
      quizData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Create Quiz:", response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    const response = await API.delete(`${InstructorRouterEndPoints.instructorDeleteQuiz}/${quizId}`);
    console.log("Delete Quiz:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getQuizById = async (quizId: string) => {
  try {
    const response = await API.get(`${InstructorRouterEndPoints.instructorGetQuizById}/${quizId}`);
    console.log("Get Quiz By ID:", response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getQuizByCourseId = async (courseId: string) => {
  try {
    const response = await API.get(`${InstructorRouterEndPoints.instructorGetQuizByCourseId}/${courseId}`);
    console.log("Get Quiz By Course ID:", response.data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getPaginatedQuestionsByCourseId = async (
  courseId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  try {
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorGetQuizByCourseId}/${courseId}/paginated`,
      {
        params: { page, limit, search },
        withCredentials: true,
      }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const addQuestionToQuiz = async (
  courseId: string,
  questionData: IQuestionPayload
) => {
  try {
    const response = await API.post(
      `${InstructorRouterEndPoints.instructorAddQuestion}/${courseId}/question`,
      questionData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuestionInQuiz = async (
  quizId: string,
  questionId: string,
  questionData: IQuestionPayload
) => {
  try {
    const response = await API.put(
      `${InstructorRouterEndPoints.instructorUpdateQuestion}/${quizId}/question/${questionId}`,
      questionData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteQuestionFromQuiz = async (
  quizId: string,
  questionId: string
): Promise<{ message: string }> => {
  try {
    const response = await API.delete(
      `${InstructorRouterEndPoints.instructorDeleteQuestion}/${quizId}/question/${questionId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const publishCourse = async(courseId:string) => {
  try {
    const response = await API.patch(`${InstructorRouterEndPoints.instructorPublishCourseById}/${courseId}/publish`)

    return response.data
  } catch (error) {
    throw error
  }
}

// ================= Instructor Dashboard API Actions =================

// Fetch overall instructor dashboard data (revenue, enrollments, etc.)
export const getDashboard = async () => {
  try {
    const response = await API.get(
      InstructorRouterEndPoints.instructorGetDashboard
    );
    // Return only the required data part from response
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Fetch instructor revenue dashboard report (with filters like daily, weekly, etc.)
export const getRevenueDashboard = async (
  range: "daily" | "weekly" | "monthly" | "yearly" | "custom",
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string
) => {
  try {
    // Build query parameters dynamically
    const queryParams = new URLSearchParams({
      range,
      page: page.toString(),
      limit: limit.toString(),
    });

    // If range is custom, include startDate and endDate
    if (range === "custom" && startDate && endDate) {
      queryParams.append("startDate", startDate);
      queryParams.append("endDate", endDate);
    }

    const endpoint = InstructorRouterEndPoints.instructorGetDashboardReport;

    // Call API with query string
    const response = await API.get(`${endpoint}?${queryParams.toString()}`);

    // Expected response: { success: true, data: any[], total: number }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export instructor revenue report (in PDF or Excel format)
export const exportRevenueReport = async (
  range: "daily" | "weekly" | "monthly" | "yearly" | "custom",
  format: "pdf" | "excel",
  startDate?: string,
  endDate?: string
): Promise<void> => {
  try {
    // Build params object for API request
    const params: Record<string, any> = { range, format };
    if (range === "custom") {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    // API request for exporting report (returns blob data)
    const response = await API.get(
      "/api/instructor/dashboard/reportRevenueExport",
      {
        params,
        responseType: "blob", // Needed to handle file downloads
      }
    );

    // Choose file name based on format
    const filename =
      format === "excel"
        ? "Instructor_Revenue_Report.xlsx"
        : "Instructor_Revenue_Report.pdf";

    // Download the file
    fileDownload(response.data, filename);
  } catch (error) {
    console.error("Failed to export report", error);
    throw error;
  }
};

// Fetch specific course dashboard details (for a single course)
export const specificCourseDashboard = async (courseId: string) => {
  try {
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorSpecificCourse}/${courseId}`
    );

    console.log('specific course', response.data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch revenue report for a specific course (with filters)
export const specificCourseReport = async (
  courseId: string,
  range: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 5
) => {
  try {
    // Build query string with filters
    const queryParams = new URLSearchParams();
    queryParams.append('range', range);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (range === 'custom') {
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
    }

    // API request for specific course revenue report
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorSpecificCourseReport}/${courseId}/revenueReport?${queryParams.toString()}`
    );

    console.log('specific course report response:', response);

    // Returning the full response instead of just data for flexibility
    return response;
  } catch (error) {
    throw error;
  }
};

// Export revenue report for a specific course (in PDF or Excel format)
export const exportSpecificCourseReport = async (
  courseId: string,
  filter: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
  startDate?: string,
  endDate?: string,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<void> => {
  try {
    // Build params object for API request
    const params: Record<string, string> = {
      range: filter,
      format,
    };

    // Add startDate and endDate if custom filter is used
    if (filter === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    // API call for downloading the specific course report
    const response = await API.get(
      `${InstructorRouterEndPoints.instructorExportSpecificCourseReport}/${courseId}/exportRevenueReport`,
      {
        params,
        responseType: 'blob', // Needed for downloading files
      }
    );

    // Choose filename based on format
    const filename =
      format === 'excel'
        ? 'Specific_Course_Revenue_Report.xlsx'
        : 'Specific_Course_Revenue_Report.pdf';

    // Trigger file download
    fileDownload(response.data, filename);
  } catch (error) {
    console.error('Failed to export specific course report:', error);
    throw error;
  }
};
