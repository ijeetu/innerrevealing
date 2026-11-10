'use client'
import React from 'react'
import quizImg from '@/assets/images/lesson-overview/quiz-start.svg'
import { useDispatch, useSelector } from 'react-redux'
import { selectedCurriculumItemSelector, setIsCurriculumItemCompleted } from '@/redux/reducers/helpersReducer'
import { startQuiz } from '@/utils/api/user/lesson-overview/quiz/startQuiz'
import toast from 'react-hot-toast'
import { extractErrorMessage } from '@/utils/helpers'
import { useTranslation } from '@/hooks/useTranslation'
import ThemeSvg from '@/components/commonComp/customImage/ThemeSvg'

interface StartQuizProps {
  isStartingQuiz: boolean;
  setIsStartingQuiz: (isStartingQuiz: boolean) => void;
  setAttemptId?: (attemptId: number) => void;
}

const StartQuiz: React.FC<StartQuizProps> = ({ isStartingQuiz, setIsStartingQuiz, setAttemptId }) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
  const isQuizSkippable = selectedCurriculumItem?.can_skip;

  // Handle start quiz function with proper error handling
  const handleStartQuiz = async () => {
    try {
      // Call the start quiz API
      const response = await startQuiz({
        course_chapter_quiz_id: selectedCurriculumItem?.id as number,
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to start quiz");
        }
        else {
          setIsStartingQuiz(true);
          // Pass attempt_id to parent component if available
          // The attempt_id is stored in the 'id' field of the response data
          if (response.data?.id) {
            setAttemptId?.(response.data.id);
          }
        }

      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    }
  }

  const handleSkipQuiz = () => {
    if (isQuizSkippable) {
      dispatch(setIsCurriculumItemCompleted({ completed: true }));
    }
  }

  return (
    <div>
      <div className='primaryLightBg py-2 px-6 primaryColor text-center'>
        {`You need ${selectedCurriculumItem?.passing_score} points to unlock and move to the next chapter.`}
      </div>
      <div className='flexColCenter gap-y-6 py-20'>
        <ThemeSvg
          src={quizImg}
          alt='quiz'
          className={`w-[200px] h-[160px] md:w-[366px] md:h-[300px] object-cover`}
          colorMap={{
            "#5A5BB5": "var(--primary-color)",
            "#04294C": "var(--hover-color)",
            "#EEF2FA": "var(--primary-light-color)",
          }}
        />
        <div className='flexColCenter gap-y-2 text-center'>
          <h2 className='text-xl font-semibold'>{t("start_quiz_title")}</h2>
          <p className='text-gray-500'>
            {t("start_quiz_description")}
          </p>
        </div>
        <div className='flexCenter gap-6'>
          <button
            onClick={handleStartQuiz}
            disabled={isStartingQuiz}
            className={`text-xl bg-black text-white px-6 py-2 rounded-[4px] ${isStartingQuiz ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            {isStartingQuiz ? t("starting_quiz") : t("start_quiz")}
          </button>
          <button className={`${isQuizSkippable ? 'cursor-pointer' : 'cursor-not-allowed text-gray-400'} text-xl border px-6 py-2 rounded-[4px]`} disabled={!isQuizSkippable}
            onClick={handleSkipQuiz}
          >{t("skip_quiz")}</button>
        </div>
      </div>

    </div>
  )
}

export default StartQuiz
