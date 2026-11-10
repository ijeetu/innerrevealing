"use client";
import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LectureForm from "./forms/LectureForm";
import QuizModal from "./modals/QuizModal";
import AssignmentForm from "./forms/AssignmentForm";
import ResourcesForm from "./forms/ResourcesForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useDispatch, useSelector } from "react-redux";
import { isEditCurriculumSelector, setIsEditCurriculum } from "@/redux/reducers/helpersReducer";
import { resetAssignmentData, resetLectureData, resetQuizData, resetResourcesData } from "@/redux/instructorReducers/createCourseReducers/curriculamSlice";

export type TabType = "lecture" | "quiz" | "resources" | "assignment" | null;

interface ContentTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function ContentTabs({
  activeTab,
  setActiveTab,
}: ContentTabsProps) {

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const isEditCurriculum = useSelector(isEditCurriculumSelector);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleTabChange = (value: TabType) => {
    setActiveTab(value);
    switch (isEditCurriculum) {
      case 'lecture':
        dispatch(resetLectureData());
        break;
      case 'assignment':
        dispatch(resetAssignmentData());
        break;
      case 'resources':
        dispatch(resetResourcesData());
        break;
      case 'quiz':
        dispatch(resetQuizData());
        break;
      default:
        break;
    }

    dispatch(setIsEditCurriculum(null));
  };

  const handleLectureTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(resetLectureData());
    dispatch(setIsEditCurriculum(null));
  };

  const handleAssignmentTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(resetAssignmentData());
    dispatch(setIsEditCurriculum(null));
  };

  const handleResourcesTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(resetResourcesData());
    dispatch(setIsEditCurriculum(null));
  };

  const handleQuizTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuizModalOpen(true);
    dispatch(setIsEditCurriculum(null));
    dispatch(resetQuizData());
  };

  return (
    <div className="py-1">
      <div className="flex justify-between items-center sectionBg p-4 rounded-lg  flex-wrap gap-2 h-full">
        <p className="text-gray-600 text-sm">{t("start_building_your_content")}</p>

        {/* Tab System */}
        <Tabs
          defaultValue="lecture"
          value={activeTab || ''}
          onValueChange={(value: string) => { handleTabChange(value as TabType); }}
          className="w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <TabsList
            className="grid grid-cols-2 md:grid-cols-4 gap-2 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <TabsTrigger
              value="lecture"
              className="flex items-center bg-white rounded-[3px]"
              onClick={(e) => handleLectureTabClick(e)}
            >
              <BiPlus className="h-4 w-4" /> {t("lecture")}
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="flex items-center bg-white rounded-[3px]"
              onClick={handleQuizTabClick}
            >
              <BiPlus className="h-4 w-4" /> {t("quiz")}
            </TabsTrigger>
            <TabsTrigger
              value="assignment"
              className="flex items-center bg-white rounded-[3px]"
              onClick={(e) => handleAssignmentTabClick(e)}
            >
              <BiPlus className="h-4 w-4" /> {t("assignment")}
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="flex items-center bg-white rounded-[3px]"
              onClick={(e) => handleResourcesTabClick(e)}
            >
              <BiPlus className="h-4 w-4" /> {t("resources")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === "lecture" && (
        <div className="mt-4 border borderColor rounded-lg p-4">
          <LectureForm setActiveTab={setActiveTab} />
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
      />

      {activeTab === "assignment" && (
        <div className="mt-4 border borderColor rounded-lg p-4">
          <AssignmentForm setActiveTab={setActiveTab} />
        </div>
      )}

      {activeTab === "resources" && (
        <div className="mt-4 border borderColor rounded-lg p-2">
          <ResourcesForm setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
}
