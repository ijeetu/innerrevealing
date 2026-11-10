"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CurriculumTabDataType, QuizTabDataType } from "@/types/instructorTypes/instructorTypes";
import { useDispatch, useSelector } from "react-redux";
import { curriculamDataSelector, quizDataSelector, setIsCurriculumCreated, setQuizData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";
import toast from "react-hot-toast";
import { createCurriculumWithData, CurriculumCreationFormData } from "@/utils/api/instructor/createCourseApis/create-course/createCurriculum";
import { isEditCurriculumSelector, lectureTypeIdSelector, setIsEditCurriculum } from "@/redux/reducers/helpersReducer";
import { updateQuizWithData, QuizUpdateFormData } from "@/utils/api/instructor/editCourse/editQuiz";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizModal({
  open,
  onOpenChange,
}: QuizModalProps) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [passGrade, setPassGrade] = useState("");
  const [enableSkip, setEnableSkip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{ title?: string; totalPoints?: string; passGrade?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; totalPoints?: string; passGrade?: string } = {};
    if (!title.trim()) newErrors.title = t("quiz_title_required");
    if (!totalPoints.trim()) newErrors.totalPoints = t("total_points_required");
    if (!passGrade.trim()) newErrors.passGrade = t("pass_grade_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const dispatch = useDispatch();
  const quizData = useSelector(quizDataSelector) as QuizTabDataType;
  const curriculamData = useSelector(curriculamDataSelector) as CurriculumTabDataType;
  const { chapterId } = curriculamData;
  const isEditCurriculum = useSelector(isEditCurriculumSelector);
  const lectureTypeId = useSelector(lectureTypeIdSelector);

  const isQuizEdit = isEditCurriculum === 'quiz';
  const { t } = useTranslation();

  const handleCreateQuizCurriculum = async () => {
    if (isLoading) return; // Prevent multiple submissions

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Validate required data
      if (!chapterId) {
        toast.error("Please select a chapter first");
        return;
      }

      // Create curriculum data for quiz
      const curriculumData = {
        chapter_id: chapterId,
        type: 'quiz' as const,
        quiz_title: title,
        quiz_description: description || '',
        quiz_total_points: parseInt(totalPoints),
        quiz_passing_score: parseInt(passGrade),
        quiz_can_skip: enableSkip ? 1 : 0,
        resource_status: 0
      };

      // Call the API
      const result = await createCurriculumWithData(curriculumData as unknown as CurriculumCreationFormData, false);

      if (result.success) {
        toast.success("Quiz created successfully!");
        dispatch(setIsCurriculumCreated(true));
        onOpenChange(false);
        dispatch(setQuizData({
          ...quizData,
          quiz_title: title,
          quiz_total_points: Number(totalPoints),
          quiz_passing_score: Number(passGrade),
          quiz_can_skip: enableSkip,
        }));

        // Reset the form
        setTitle("");
        setDescription("");
        setTotalPoints("");
        setPassGrade("");

      } else {
        toast.error(result.error || result.message || "Failed to create quiz");
      }

    } catch (error) {
      console.log(error);
      console.error("Error creating quiz curriculum:", error);
      toast.error("Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  // Separate effect to handle opening the modal when isQuizEdit becomes true
  useEffect(() => {
    if (isQuizEdit && !open) {
      onOpenChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuizEdit]);

  // Effect to handle field populations/resets when the modal opens
  useEffect(() => {
    if (open) {
      if (isQuizEdit) {
        setTitle(quizData.quiz_title || "");
        setTotalPoints(quizData.quiz_total_points?.toString() || "");
        setPassGrade(quizData.quiz_passing_score?.toString() || "");
        setEnableSkip(!!quizData.quiz_can_skip);
        setDescription(""); // Add description if it exists in quizData
      } else {
        // Reset fields for Add mode
        setTitle("");
        setTotalPoints("");
        setPassGrade("");
        setEnableSkip(false);
        setDescription("");
      }
    }
  }, [open, isQuizEdit, quizData]);

  const handleUpdateQuizCurriculum = async () => {
    if (isLoading) return; // Prevent multiple submissions

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Validate required data
      if (!chapterId) {
        toast.error("Please select a chapter first");
        return;
      }

      // Get the quiz ID from lectureTypeId (curriculum ID)
      if (!lectureTypeId) {
        toast.error("Quiz ID not found for update");
        return;
      }

      // Create quiz update data
      const quizUpdateData: QuizUpdateFormData = {
        quiz_type_id: lectureTypeId, // Use curriculum ID as lecture_type_id for update
        chapter_id: chapterId,
        is_active: 1,
        type: 'quiz',
        qa_required: 0,
        quiz_title: title,
        quiz_description: description || '', // Use description from form
        quiz_total_points: parseInt(totalPoints) || 0,
        quiz_passing_score: parseInt(passGrade) || 0,
        quiz_can_skip: enableSkip ? 1 : 0,
        resource_status: 0
      };

      // Call the update API
      const result = await updateQuizWithData(quizUpdateData);

      if (result.success) {
        toast.success(result.message || "Quiz updated successfully!");
        dispatch(setIsCurriculumCreated(true));
        dispatch(setIsEditCurriculum(null));
        onOpenChange(false);

        // Update the quiz data in Redux store
        dispatch(setQuizData({
          ...quizData,
          quiz_title: title,
          quiz_total_points: Number(totalPoints),
          quiz_passing_score: Number(passGrade),
          quiz_can_skip: enableSkip,
        }));

        // Reset the form
        setTitle("");
        setDescription("");
        setTotalPoints("");
        setPassGrade("");
        setEnableSkip(false);

      } else {
        toast.error(result.error || result.message || "Failed to update quiz");
      }

    } catch (error) {
      console.error("Error updating quiz curriculum:", error);
      toast.error("Failed to update quiz");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      dispatch(setIsEditCurriculum(null));
    }
  }, [open]);

  const handlePassGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setErrors((prev) => ({ ...prev, passGrade: undefined }));

    if (val === "") {
      setPassGrade("");
      return;
    }

    const num = Number(val);
    if (num >= 1 && num <= 100) {
      setPassGrade(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isQuizEdit ? t("edit_quiz") : t("add_quiz")}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="quizTitle" className="requireField">{t("quiz_title")}</Label>
            <Input
              className={`sectionBg ${errors.title ? "border-red-500" : ""}`}
              id="quizTitle"
              placeholder={t("quiz_title")}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPoints" className="requireField">{t("total_points")}</Label>
            <Input
              className={`sectionBg ${errors.totalPoints ? "border-red-500" : ""}`}
              id="totalPoints"
              placeholder={t("total_points_placeholder")}
              value={totalPoints}
              onChange={(e) => { setTotalPoints(e.target.value); setErrors((prev) => ({ ...prev, totalPoints: undefined })); }}
              type="number"
            />
            {errors.totalPoints && <p className="text-sm text-red-500">{errors.totalPoints}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passGrade" className="requireField">{t("pass_grade_percentage")}</Label>
            <Input
              className={`sectionBg ${errors.passGrade ? "border-red-500" : ""}`}
              id="passGrade"
              placeholder={t("pass_grade_placeholder")}
              value={passGrade}
              onChange={handlePassGradeChange}
              type="number"
              min={1}
              max={100}
            />
            {errors.passGrade
              ? <p className="text-sm text-red-500">{errors.passGrade}</p>
              : <p className="text-sm text-gray-500">{t("passing_percentage_required")}</p>
            }
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableSkip"
              checked={enableSkip}
              onCheckedChange={(checked) =>
                setEnableSkip(checked as boolean)
              }
              className="h-5 w-5 rounded-sm primaryBorder data-[state=checked]:primaryBg data-[state=checked]:text-white"
            />
            <Label htmlFor="enableSkip" className="text-sm cursor-pointer">
              {t("check_this_if_you_want_to_enable_the_quiz_skip_feature")}
            </Label>
          </div>

          <button
            onClick={isQuizEdit ? handleUpdateQuizCurriculum : handleCreateQuizCurriculum}
            className="w-full mt-2 commonBtn"
            disabled={isLoading}
          >
            {isLoading ? isQuizEdit ? t("updating_quiz") : t("creating_quiz") : isQuizEdit ? t("update_quiz") : t("add_quiz")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
