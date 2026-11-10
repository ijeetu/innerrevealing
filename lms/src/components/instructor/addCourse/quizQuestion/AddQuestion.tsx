import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { quizIdSelector, setQuizQuestionId } from '@/redux/reducers/helpersReducer';
import { addQuizQuestion, QuizQuestionData } from '@/utils/api/instructor/createCourseApis/create-course/quizQuestion/addQuestion';
import { getQuestionDetails } from '@/utils/api/instructor/createCourseApis/create-course/quizQuestion/getQuestionDetails';
import { extractErrorMessage } from '@/utils/helpers';
import { updateQuizQuestionById } from '@/utils/api/instructor/editCourse/editQuizQuestion';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { useTranslation } from '@/hooks/useTranslation';

// Define Zod schema for quiz question form validation
// This schema validates all required fields and quiz-specific requirements
// For single-choice questions, exactly one option must be correct
const quizQuestionSchema = z.object({
    title: z.string().min(1, "Question title is required").max(200, "Title must be less than 200 characters"),
    media: z.any().optional(), // Media is optional for quiz questions
    options: z.array(z.object({
        id: z.string(),
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean()
    })).min(2, "At least 2 options are required")
}).refine((data) => {
    // Validate that exactly one option is marked as correct (single-choice)
    const correctAnswersCount = data.options.filter(option => option.isCorrect).length;
    return correctAnswersCount === 1;
}, {
    message: "Please select exactly one correct answer",
    path: ["options"]
});

// Define a type for form errors
type FormErrors = {
    title?: string;
    media?: string;
    options?: string;
};


interface AddQuestionProps {
    fetchCurriculumList: () => void;
    quizId: number;
    setisAddQuestionForm: (isAddQuestionForm: boolean) => void;
}

const AddQuestion = ({ fetchCurriculumList, quizId, setisAddQuestionForm }: AddQuestionProps) => {

    const quizQuestionId = useSelector(quizIdSelector);
    const dispatch = useDispatch();

    const [quizQuestionData, setQuizQuestionData] = useState({
        title: "",
        media: null as File | null,
        options: [] as Array<{
            id: string;
            text: string;
            isCorrect: boolean;
        }>,
    });

    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

    // Form errors state
    const [errors, setErrors] = useState<FormErrors>({});
    const { t } = useTranslation();

    // Validate form using Zod
    // This function validates the form data against the Zod schema and sets error states
    const validateForm = () => {
        try {
            // Prepare data for validation
            const validationData = {
                title: quizQuestionData.title,
                media: quizQuestionData.media,
                options: quizOptions
            };

            // Validate form data with Zod schema
            quizQuestionSchema.parse(validationData);

            // Clear all errors if validation passes
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Convert Zod errors to our error format for display in UI
                const newErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        const fieldName = err.path[0] as keyof FormErrors;
                        newErrors[fieldName] = err.message;
                    }
                });

                setErrors(newErrors);
                toast.error("Please fix the validation errors before submitting");
            }
            return false;
        }
    };

    // Quiz options state
    const [quizOptions, setQuizOptions] = useState<Array<{
        id: string;
        text: string;
        isCorrect: boolean;
    }>>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
    ]);

    // Quiz options handlers
    const addQuizOption = () => {
        const newId = (quizOptions.length + 1).toString();
        setQuizOptions([...quizOptions, { id: newId, text: '', isCorrect: false }]);
    };

    const removeQuizOption = (id: string) => {
        if (quizOptions.length > 2) { // Keep minimum 2 options
            const optionToRemove = quizOptions.find(opt => opt.id === id);
            const remainingOptions = quizOptions.filter(option => option.id !== id);

            // If the removed option was correct, set the first remaining option as correct
            // This ensures we always have exactly one correct answer
            if (optionToRemove?.isCorrect && remainingOptions.length > 0) {
                remainingOptions[0].isCorrect = true;
            }

            setQuizOptions(remainingOptions);
        }
    };

    const updateQuizOptionText = (id: string, text: string) => {
        setQuizOptions(quizOptions.map(option =>
            option.id === id ? { ...option, text } : option
        ));

        // Clear options error when user types
        if (errors.options) {
            setErrors({ ...errors, options: "" });
        }
    };

    // Handle single-choice selection - only one option can be correct
    const toggleQuizOptionCorrect = (id: string) => {
        // Set the selected option as correct and all others as incorrect
        setQuizOptions(quizOptions.map(option =>
            option.id === id
                ? { ...option, isCorrect: true }
                : { ...option, isCorrect: false }
        ));

        // Clear options error when user selects correct answer
        if (errors.options) {
            setErrors({ ...errors, options: "" });
        }
    };

    useEffect(() => {
        setQuizQuestionData({ ...quizQuestionData, options: quizOptions });
    }, [quizOptions]);

    // Handle quiz submission - Add question to existing quiz
    const handleQuizSubmit = async (quizId: number) => {
        try {
            // Validate form using Zod
            if (!validateForm()) {
                return;
            }

            // Additional validation for required context
            if (!quizId) {
                toast.error("Quiz ID is missing. Please create a quiz first.");
                return;
            }

            setIsSubmittingQuiz(true);

            // Format quiz question data according to the new API structure
            const validOptions = quizOptions.filter(option => option.text.trim() !== '');
            const questionData: QuizQuestionData = {
                quiz_id: quizId,
                question: quizQuestionData.title,
                option_data: validOptions.map((option) => ({
                    option: option.text,
                    is_correct: option.isCorrect ? 1 : 0
                }))
            };

            // Call the addQuizQuestion API
            const response = await addQuizQuestion(questionData);

            if (response.success) {
                toast.success("Quiz question added successfully!");
                setisAddQuestionForm(false);

                // Reset form after successful submission
                setQuizQuestionData({
                    title: "",
                    media: null,
                    options: []
                });
                setQuizOptions([
                    { id: '1', text: '', isCorrect: false },
                    { id: '2', text: '', isCorrect: false }
                ]);

                // Refresh curriculum list to show the updated quiz
                fetchCurriculumList();
            } else {
                toast.error(response.error || "Failed to add quiz question");
                console.error("Quiz question addition failed:", response);
            }

        } catch (error) {
            console.error("Error submitting quiz question:", error);
            toast.error("An unexpected error occurred while adding the quiz question");
        } finally {
            setIsSubmittingQuiz(false);
        }
    };


    const fetchQuestionDetails = async () => {
        if (!quizQuestionId) {
            console.log('Missing quizQuestionId');
            return;
        }
        setIsLoadingQuestion(true);
        try {
            // Fetch question details using the API
            const response = await getQuestionDetails({ question_id: quizQuestionId });

            if (response) {
                // Check if API returned an error (error: true in response)
                if (!response.error) {
                    if (response.data) {
                        const questionData = response.data;

                        // Update the form state with fetched data
                        setQuizQuestionData({
                            title: questionData.question.question,
                            media: null, // Media handling can be added later if needed
                            options: questionData.options.map(option => ({
                                id: option.id.toString(),
                                text: option.option,
                                isCorrect: option.is_correct
                            }))
                        });

                        // Update quiz options state for the UI
                        // Ensure only one option is marked as correct (single-choice)
                        let mappedOptions = questionData.options.map((option) => ({
                            id: option.id.toString(),
                            text: option.option,
                            isCorrect: option.is_correct
                        }));

                        // If multiple options are marked as correct, keep only the first one
                        const correctCount = mappedOptions.filter(opt => opt.isCorrect).length;
                        if (correctCount > 1) {
                            // Find the first correct option and reset all others
                            let foundFirst = false;
                            mappedOptions = mappedOptions.map(opt => {
                                if (opt.isCorrect && !foundFirst) {
                                    foundFirst = true;
                                    return { ...opt, isCorrect: true };
                                }
                                return { ...opt, isCorrect: false };
                            });
                        }

                        setQuizOptions(mappedOptions);
                    } else {
                        console.log('No question details data found in response');
                        toast.error('Failed to load question details');
                    }
                } else {
                    console.log("API error:", response.message);
                    toast.error(response.message || "Failed to fetch question details");
                }
            } else {
                console.log("response is null in component", response);
                toast.error('Failed to fetch question details');
            }
        } catch (error) {
            extractErrorMessage(error);
            toast.error('An unexpected error occurred while fetching question details');
        } finally {
            setIsLoadingQuestion(false);
        }
    };

    useEffect(() => {
        if (quizQuestionId) {
            fetchQuestionDetails();
        } else {
            // Reset form when switching to add mode
            setQuizQuestionData({
                title: "",
                media: null,
                options: [
                    { id: '1', text: '', isCorrect: false },
                    { id: '2', text: '', isCorrect: false }
                ]
            });
            setQuizOptions([
                { id: '1', text: '', isCorrect: false },
                { id: '2', text: '', isCorrect: false }
            ]);
            setErrors({});
        }
    }, [quizQuestionId]);


    const handleEditQuizQuestion = async () => {
        if (!quizQuestionId ) {
            toast.error("Missing quiz question ID");
            return;
        }

        try {
            // Validate form using Zod
            if (!validateForm()) {
                return;
            }

            setIsSubmittingQuiz(true);

            // Prepare options data for the API
            const optionsData = quizQuestionData.options.map(option => ({
                option: option.text,
                is_correct: option.isCorrect ? 1 : 0
            }));

            // Call the update API
            const response = await updateQuizQuestionById(
                quizId,
                quizQuestionId,
                quizQuestionData.title,
                optionsData
            );

            if (response.success) {
                toast.success("Question updated successfully!");
                dispatch(setQuizQuestionId(null))
                fetchCurriculumList(); // Refresh the curriculum list
                setisAddQuestionForm(false); // Close the form

                // Reset form after successful update
                setQuizQuestionData({
                    title: "",
                    media: null,
                    options: [
                        { id: '1', text: '', isCorrect: false },
                        { id: '2', text: '', isCorrect: false }
                    ]
                });
                setQuizOptions([
                    { id: '1', text: '', isCorrect: false },
                    { id: '2', text: '', isCorrect: false }
                ]);
            } else {
                toast.error(response.error || "Failed to update question");
                console.error("Question update failed:", response);
            }

        } catch (error) {
            console.error("Error updating quiz question:", error);
            toast.error("An unexpected error occurred while updating the question");
        } finally {
            setIsSubmittingQuiz(false);
        }
    }

    return (
        <div className="">
            <div className="border rounded-lg overflow-hidden borderColor">
                <div className="border-b borderColor px-4 pt-4">
                    <h3 className="font-semibold mb-4 text-sm">
                        {quizQuestionId ? t("edit_question") : t("add_question")}
                    </h3>
                </div>

                <div className="space-y-5 p-4">
                    {isLoadingQuestion && (
                        <div className="flex items-center justify-center py-4">
                            <div className="text-sm text-gray-600">{t("loading_question_details")}</div>
                        </div>
                    )}
                    <div>
                        <label className="mb-2 text-sm font-medium requireField">
                            {t("question_title")}{" "}
                        </label>
                        <Input
                            className={`w-full sectionBg ${errors.title ? "border-red-500" : ""}`}
                            placeholder={t("what_does_ui_stand_for_in_ui_design")}
                            value={quizQuestionData.title}
                            onChange={(e) => {
                                setQuizQuestionData({ ...quizQuestionData, title: e.target.value });
                                // Clear title error when user types
                                if (errors.title) {
                                    setErrors({ ...errors, title: "" });
                                }
                            }}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 text-sm font-medium requireField">
                            {t("add_answer")}{" "}
                        </label>
                        <div className="space-y-4 mb-2">
                            {/* Dynamic Quiz Options - Single Choice (Radio Button) */}
                            {quizOptions.map((option, index) => (
                                <div key={option.id} className="flex items-center gap-2">
                                    <div className={`rounded-md p-2 flex items-center justify-center transition-colors ${option.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-gray-50'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="correct-answer"
                                            className={`h-4 w-4 border-gray-300 transition-colors ${option.isCorrect ? 'text-green-600 border-green-600' : ''
                                                }`}
                                            checked={option.isCorrect}
                                            onChange={() => toggleQuizOptionCorrect(option.id)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            className="border border-gray-200 sectionBg shadow-none"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            value={option.text}
                                            onChange={(e) => updateQuizOptionText(option.id, e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            className={`text-xl transition-colors ${quizOptions.length <= 2
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'hover:text-red-500 cursor-pointer'
                                                }`}
                                            onClick={() => removeQuizOption(option.id)}
                                            disabled={quizOptions.length <= 2}
                                            title={quizOptions.length <= 2 ? "Minimum 2 options required" : "Remove option"}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className=" text-sm primaryColor py-1.5"
                            onClick={addQuizOption}
                        >
                            <span className="primaryColor mr-1">
                                +
                            </span>{" "}
                            {t("add_options")}
                        </button>
                        {errors.options && (
                            <p className="text-red-500 text-sm mt-1">{errors.options}</p>
                        )}
                    </div>

                    <Button
                        className="primaryBg text-white hover:primaryBg/90 py-1.5 text-sm"
                        onClick={() => quizQuestionId ? handleEditQuizQuestion() : handleQuizSubmit(quizId)}
                        disabled={isSubmittingQuiz}
                    >
                        {isSubmittingQuiz ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {quizQuestionId ? t("editing_question") : t("creating_question")}
                            </>
                        ) : (
                            quizQuestionId ? t("update_question") : t("add_question")
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddQuestion
