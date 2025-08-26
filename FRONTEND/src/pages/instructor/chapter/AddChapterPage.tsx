import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import Card from "../../../components/common/Card";
import InputField from "../../../components/common/InputField";
import { createChapter } from "../../../api/action/InstructorActionApi";
import { Button } from "../../../components/common/Button";
import { Loader2 } from "lucide-react";

const textOnlyRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

const chapterSchema = Yup.object().shape({
  chapterTitle: Yup.string()
    .transform((value) => value.trim())
    .min(5, "Chapter title must be at least 5 characters long")
    .matches(
      textOnlyRegex,
      "Chapter title must contain only letters and single spaces"
    )
    .test(
      "not-blank",
      "Chapter title cannot be only spaces",
      (value) => !!value && value.trim().length >= 5
    )
    .required("Chapter title is required"),
  description: Yup.string()
    .transform((value) => value.trim())
    .min(10, "Description must be at least 10 characters long")
    .matches(
      textOnlyRegex,
      "Description must contain only letters and single spaces"
    )
    .test(
      "not-blank",
      "Description cannot be only spaces",
      (value) => !!value && value.trim().length >= 10
    )
    .required("Description is required"),
  chapterNumber: Yup.number()
    .typeError("Chapter number must be a valid number")
    .positive("Chapter number must be a positive value")
    .integer("Chapter number must be an integer")
    .required("Chapter number is required"),
});

const AddChapterPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed.");
      e.target.value = "";
      setVideoFile(null);
      setVideoPreview(null);
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleCaptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["vtt", "srt"].includes(ext || "")) {
      toast.error("Only .vtt or .srt files are allowed.");
      setCaptionFile(null);
      return;
    }
    setCaptionFile(file);
  };

  const handleSubmit = async (values: any) => {
    if (!courseId) return toast.error("Invalid course ID");
    if (!videoFile) return toast.error("Video file is required.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("chapterTitle", values.chapterTitle);
      formData.append("description", values.description);
      formData.append("chapterNumber", String(values.chapterNumber));
      formData.append("courseId", courseId);
      formData.append("video", videoFile);
      if (captionFile) formData.append("captions", captionFile);

      const res = await createChapter(courseId, formData);
      toast.success(res?.data?.message);
      navigate(`/instructor/course/${courseId}/chapters`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Chapter creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 bg-[#121a29] min-h-screen">
      <Card
        title="Add Chapter"
        padded
        className="bg-gray-900/80 border border-gray-700 rounded-3xl shadow-2xl backdrop-blur-md"
      >
        <Formik
          initialValues={{
            chapterTitle: "",
            description: "",
            chapterNumber: "",
          }}
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

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-orange-400">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
                {videoPreview && (
                  <video
                    controls
                    src={videoPreview}
                    className="w-full max-h-96 rounded-xl border border-gray-600 mt-2"
                  />
                )}
              </div>

              {/* Captions Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-orange-400">
                  Caption File (optional)
                </label>
                <input
                  type="file"
                  accept=".vtt,.srt"
                  onChange={handleCaptionsChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold rounded-2xl px-6 py-3 shadow-lg transition-transform transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Uploading...
                  </>
                ) : (
                  "Create Chapter"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default AddChapterPage;
