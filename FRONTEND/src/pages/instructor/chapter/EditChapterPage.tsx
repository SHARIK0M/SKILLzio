import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";

import Card from "../../../components/common/Card";
import InputField from "../../../components/common/InputField";
import { Button } from "../../../components/common/Button";
import {
  getChapterById,
  updateChapter,
} from "../../../api/action/InstructorActionApi";

const BUCKET_BASE_URL = "https://your-s3-bucket.s3.amazonaws.com"; // Replace with your actual base URL

const chapterSchema = Yup.object().shape({
  chapterTitle: Yup.string()
    .transform((val) => (typeof val === "string" ? val.trim() : ""))
    .min(5, "Chapter title must be at least 5 characters")
    .test(
      "not-blank",
      "Chapter title cannot be only spaces",
      (val) => typeof val === "string" && val.trim().length >= 5
    )
    .required("Chapter title is required"),

  description: Yup.string()
    .transform((val) => (typeof val === "string" ? val.trim() : ""))
    .min(10, "Description must be at least 10 characters")
    .test(
      "not-blank",
      "Description cannot be only spaces",
      (val) => typeof val === "string" && val.trim().length >= 10
    )
    .required("Description is required"),

  chapterNumber: Yup.number()
    .typeError("Chapter number must be a number")
    .positive("Must be a positive number")
    .integer("Must be an integer")
    .required("Chapter number is required"),
});

const EditChapterPage = () => {
  const { courseId, chapterId } = useParams<{
    courseId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    chapterTitle: "",
    description: "",
    chapterNumber: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [existingCaptionsUrl, setExistingCaptionsUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const data = await getChapterById(courseId!, chapterId!);
        if (!data) return toast.error("Chapter not found");

        setInitialValues({
          chapterTitle: data.chapterTitle || "",
          description: data.description || "",
          chapterNumber: data.chapterNumber || "",
        });

        if (data.videoPresignedUrl) setExistingVideoUrl(data.videoPresignedUrl);
        if (data.captionsUrl)
          setExistingCaptionsUrl(`${BUCKET_BASE_URL}/${data.captionsUrl}`);
      } catch {
        toast.error("Failed to load chapter");
      }
    };

    if (chapterId && courseId) fetchChapter();
  }, [chapterId, courseId]);

  const handleSubmit = async (values: typeof initialValues) => {
    if (!courseId || !chapterId) return toast.error("Invalid request");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("chapterTitle", values.chapterTitle.trim());
      formData.append("description", values.description.trim());
      formData.append("chapterNumber", String(values.chapterNumber));
      formData.append("courseId", courseId);
      if (videoFile) formData.append("video", videoFile);
      if (captionFile) formData.append("captions", captionFile);

      await updateChapter(courseId, chapterId, formData);
      toast.success("Chapter updated successfully");
      navigate(`/instructor/course/${courseId}/chapters`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update chapter";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 bg-[#121a29] min-h-screen">
      <Card
        title="Edit Chapter"
        padded
        className="bg-gray-900/80 border border-gray-700 rounded-3xl shadow-2xl backdrop-blur-md"
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={chapterSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-6">
              <InputField name="chapterTitle" label="Chapter Title" useFormik />
              <InputField name="description" label="Description" useFormik />
              <InputField
                name="chapterNumber"
                label="Chapter Number"
                type="number"
                useFormik
              />

              {/* Video File Section */}
              <div className="space-y-2">
                <label className="block font-semibold text-orange-400">
                  Existing Video
                </label>
                {existingVideoUrl && (
                  <video
                    src={existingVideoUrl}
                    controls
                    className="w-full max-h-96 rounded-xl border border-gray-600"
                  />
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              {/* Caption File Section */}
              <div className="space-y-2">
                <label className="block font-semibold text-orange-400">
                  Existing Captions
                </label>
                {existingCaptionsUrl && (
                  <a
                    href={existingCaptionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline block mb-2"
                  >
                    View current captions
                  </a>
                )}
                <input
                  type="file"
                  accept=".vtt,.srt"
                  onChange={(e) => setCaptionFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold rounded-2xl px-6 py-3 shadow-lg transition-transform transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Saving...
                  </>
                ) : (
                  "Update Chapter"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default EditChapterPage;
