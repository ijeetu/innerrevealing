'use client'
import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { Course } from '@/utils/api/user/getCourse';


interface CourseDescriptionSectionProps {
  courseData: Course;
}

const CourseDescriptionSection: React.FC<CourseDescriptionSectionProps> = ({ courseData }) => {
  const { t } = useTranslation();
  const [showMoreDescription, setShowMoreDescription] = useState<boolean>(false);
  const [showMoreLearning, setShowMoreLearning] = useState<boolean>(false);
  const [showMoreRequirements, setShowMoreRequirements] = useState<boolean>(false);

  const toggleDescription = (): void => {
    setShowMoreDescription(!showMoreDescription);
  };

  const toggleLearning = (): void => {
    setShowMoreLearning(!showMoreLearning);
  };

  const toggleRequirements = (): void => {
    setShowMoreRequirements(!showMoreRequirements);
  };

  // Get learning items from course data
  const learningItems = courseData.learnings && courseData.learnings.length > 0
    ? courseData.learnings.map(learning => learning.title)
    : []

  // Get requirements from course data
  const requirementItems = courseData.requirements && courseData.requirements.length > 0
    ? courseData.requirements.map(requirement => requirement.requirement)
    : []

  return (
    <div className="rounded-lg ">
      {/* Course Description */}
      <div className="mb-8 border-b borderColor pb-6">
        <div className="text-gray-800 mb-2">
          {showMoreDescription ? (
            // Show full description when expanded
            <p>{courseData.short_description}</p>
          ) : (
            // Show truncated description (100 characters)
            <p>{courseData.short_description && courseData.short_description.length > 100
              ? `${courseData.short_description.substring(0, 100)}`
              : courseData.short_description}
            </p>
          )}
        </div>

        {/* Show more/less button - only show if description is long enough to be truncated */}
        {courseData.short_description && courseData.short_description.length > 100 && (
          <button
            onClick={toggleDescription}
            className="primaryColor font-medium text-sm flex items-center mt-2"
          >
            {showMoreDescription ? (
              <>
                - {t("show_less")}
              </>
            ) : (
              <>
                + {t("show_more")}
              </>
            )}
          </button>
        )}
      </div>

      {/* What You'll Learn Section */}
      {learningItems.length > 0 && (
        <div className="mb-8 border-b borderColor pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("what_you_ll_learn")}</h2>

          <ul className="space-y-3">
            {learningItems.slice(0, 5).map((item, index) => (
              <li key={`learn-${index}`} className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 primaryColor">
                  <FiCheck className="w-5 h-5" />
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}

            {showMoreLearning && learningItems.length > 5 &&
              learningItems.slice(5).map((item, index) => (
                <li key={`learn-extra-${index}`} className="flex items-start">
                  <div className="mr-3 mt-1 flex-shrink-0 primaryColor">
                    <FiCheck className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))
            }
          </ul>

          {learningItems.length > 5 && (
            <button
              onClick={toggleLearning}
              className="primaryColor font-medium text-sm flex items-center mt-4"
            >
              {showMoreLearning ? (
                <>
                  - {t("show_less")}
                </>
              ) : (
                <>
                  + {t("show_more")}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Requirements Section */}
      {requirementItems.length > 0 && (
        <div className="mb-4 border-b borderColor pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("requirements")}</h2>

          <ul className="space-y-3">
            {requirementItems.slice(0, 5).map((item, index) => (
              <li key={`req-${index}`} className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 primaryColor">
                  <FiCheck className="w-5 h-5" />
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}

            {showMoreRequirements && requirementItems.length > 5 &&
              requirementItems.slice(5).map((item, index) => (
                <li key={`req-extra-${index}`} className="flex items-start">
                  <div className="mr-3 mt-1 flex-shrink-0 primaryColor">
                    <FiCheck className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))
            }
          </ul>

          {requirementItems.length > 5 && (
            <button
              onClick={toggleRequirements}
              className="primaryColor font-medium text-sm flex items-center mt-4"
            >
              {showMoreRequirements ? (
                <>
                  - {t("show_less")}
                </>
              ) : (
                <>
                  + {t("show_more")}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDescriptionSection; 