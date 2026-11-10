"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useParams, useSearchParams } from "next/navigation";
import PageHeader from "@/components/community/PageHeader";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { BiShow, BiReply, BiArrowBack } from "react-icons/bi"; // Import icons
import { Button } from "@/components/ui/button"; // Import Button
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { extractErrorMessage } from "@/utils/helpers";
import { postQuestionAnswer } from "@/utils/api/user/helpdesk/question/question-answers/postQuestionAnswer";
import { getQuestionAnswers, QuestionReply, QuestionData } from "@/utils/api/user/helpdesk/question/question-answers/getQuestionAnswers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import QuestionAndReplaySkeleton from "@/components/skeletons/help-support/QuestionAndReplaySkeleton";
import ReplySkeleton from "@/components/skeletons/help-support/ReplySkeleton";
import Highlighter from "react-highlight-words";
import { extractTextFromHTML, formatedSlug } from "@/utils/helpers";
import { useTranslation } from "@/hooks/useTranslation";
import dynamic from 'next/dynamic';
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";
import RichTextContent from "@/components/commonComp/RichText";
import { currentLanguageSelector } from "@/redux/reducers/languageSlice";
import { isLoginSelector } from "@/redux/reducers/userSlice";

// Dynamically import ReactQuill with SSR disabled to prevent "document is not defined" error
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Zod schema for validation
const replyFormSchema = z.object({
  questionId: z.number().min(1, "Question ID is required"),
  reply: z.string().min(1, "Reply content is required").max(2000, "Reply must be less than 2000 characters"),
});

// Form error type
type FormErrors = {
  questionId?: string;
  reply?: string;
};

export default function ReplyPage() {

  const { t } = useTranslation();
  const currentLanguageCode = useSelector(currentLanguageSelector)
  const params = useParams();
  // Ensure both are strings
  const groupSlug: string = typeof params.slug === "string" ? params.slug : "";
  const currentQuestionSlug: string = typeof params["question-slug"] === "string" ? params["question-slug"] : "";

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const isLogin = useSelector(isLoginSelector);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // State for question data and API loading
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [repliesData, setRepliesData] = useState<QuestionReply[]>([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Pagination state for replies
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
  const [hasInitiallyLoadedReplies, setHasInitiallyLoadedReplies] = useState(false);

  // Single state object for form
  const [formData, setFormData] = useState({
    questionId: 0, // This should come from the URL params or API call
    reply: "",
  });

  const dispatch = useDispatch();

  // Handle input change
  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    try {
      // Check if reply is empty or just whitespace
      if (!formData.reply || formData.reply.trim() === "") {
        setErrors({ reply: "Reply content is required" });
        toast.error("Please enter a reply before submitting");
        return false;
      }

      replyFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!isLogin) {
      dispatch(setIsLoginModalOpen(true));
      toast.error(t("login_first"));
      return;
    }

    // Validate form first - this will set errors if validation fails
    if (!validateForm()) {
      // Validation failed, errors are already set by validateForm()
      return;
    }

    setIsLoading(true);
    try {
      // Call the post question answer API
      const response = await postQuestionAnswer({
        question_id: formData.questionId,
        reply: formData.reply,
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (response.error) {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to post reply");
        } else {
          // Success - show success message and reset form
          toast.success(response.message || "Reply Posted Successfully!");
          setFormData(prev => ({ ...prev, reply: "" })); // Clear reply content
          setErrors({}); // Clear errors on successful submission
          // Refresh the replies list to show the new reply
          // Reset pagination and fetch fresh data
          setRepliesPage(1);
          setHasMoreReplies(true);
          setHasInitiallyLoadedReplies(false);
          await fetchQuestionAndReplies(false);
        }
      } else {
        console.log("response is null in component", response);
      }
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle load more replies functionality
  const handleLoadMore = async () => {
    if (!isLoadingQuestion && hasMoreReplies && !loadingMoreReplies) {
      setLoadingMoreReplies(true);
      await fetchQuestionAndReplies(true); // Load next page and append to existing replies
      setLoadingMoreReplies(false);
    }
  };

  // Function to fetch question and replies from API with pagination support
  const fetchQuestionAndReplies = async (loadMore: boolean = false) => {
    if (!currentQuestionSlug) {
      console.log("No question slug found");
      return;
    }

    // Calculate the page number to fetch
    const pageToFetch = loadMore ? repliesPage + 1 : 1;

    setIsLoadingQuestion(true);
    try {

      const response = await getQuestionAnswers({
        slug: currentQuestionSlug,
        page: pageToFetch,
        per_page: 5
      });

      // Check if response is valid and has data
      if (response && response.data && response.data.question) {
        // Extract question data from the new structure (data.question)
        const extractedQuestionData = response.data.question;

        // Extract replies from the new structure (data.replies)
        const extractedReplies = response.data.replies || [];

        // Set question data (only on initial load)
        if (!loadMore) {
          setQuestionData(extractedQuestionData);
        }

        // Handle replies data based on load more or initial load
        if (loadMore) {
          // Append new replies to existing ones for load more functionality
          setRepliesData(prevReplies => [...prevReplies, ...extractedReplies]);
        } else {
          // Replace replies for initial load or refresh
          setRepliesData(extractedReplies);
        }

        // Update pagination state from the new structure (pagination fields directly in data)
        if (response.data.has_more_pages !== undefined) {
          setHasMoreReplies(response.data.has_more_pages);
          setRepliesPage(pageToFetch);
        }

        // Mark that we've completed initial load
        if (!loadMore) {
          setHasInitiallyLoadedReplies(true);
        }

      } else {
        // Handle error response - response may be null or have error structure
        if (response && response.error && response.message) {
          toast.error(response.message);
        } else {
          toast.error("Failed to fetch question answers");
        }
      }
    } catch (error) {
      console.error("Error fetching question data:", error);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Call API when component mounts or question slug changes
  useEffect(() => {
    if (currentQuestionSlug) {
      // Reset pagination state when question slug changes
      setRepliesPage(1);
      setHasMoreReplies(true);
      setHasInitiallyLoadedReplies(false);
      setRepliesData([]);
      setQuestionData(null);

      fetchQuestionAndReplies(false); // Load first page, don't append
    }
  }, [currentQuestionSlug]);

  // When questionData changes, store its ID in formData
  useEffect(() => {
    if (questionData?.id) {
      setFormData((prev) => ({ ...prev, questionId: questionData.id }));
    }
  }, [questionData]);

  return (
    <Layout>
      {/* Update Page Header */}
      <PageHeader
        title={formatedSlug(currentQuestionSlug)}
        breadcrumbs={[
          { label: t("home"), href: `/?lang=${currentLanguageCode}` },
          { label: t("help_support"), href: `/help-support?lang=${currentLanguageCode}` },
          {
            label: formatedSlug(groupSlug),
            href: `/help-support/support-group/${groupSlug}?lang=${currentLanguageCode}`,
          },
          { label: formatedSlug(currentQuestionSlug) },
        ]}
      />
      <div className="sectionBg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-0">
            <CommunitySidebar currentSlug={groupSlug} />

            {/* Main Content Area */}
            <div className="flex-grow min-w-0 overflow-hidden">
              {isLoadingQuestion && !hasInitiallyLoadedReplies ? (
                <QuestionAndReplaySkeleton />
              ) : (
                <div className="p-4 md:p-6 bg-white">
                  <div className="mb-4">
                    <Link
                      href={`/help-support/support-group/${groupSlug}?lang=${currentLanguageCode}`}
                      className="flex items-center text-gray-700 hover:text-gray-900"
                    >
                      <BiArrowBack
                        size={24}
                        className="sectionBg p-1 rounded-full mr-3 rtl:rotate-180"
                      />{" "}
                      {t("back_to_discussions")}
                    </Link>
                  </div>
                  <hr className="my-4 border-gray-200" />
                  <div className="p-4 md:p-6">
                    {/* Main Discussion Post Section */}
                    <div className="border-b border-gray-200 pb-6 mb-6">
                      <div className="flex gap-3 md:gap-4 items-start">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                            <CustomImageTag
                              src={questionData?.author.avatar || ""}
                              alt={questionData?.author.name || ""}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900 break-words"
                                style={{ wordBreak: "break-word" }}>
                                <Highlighter
                                  highlightClassName="primaryLightBg p-1 primaryColor rounded-md"
                                  searchWords={[query || ""]}
                                  autoEscape={true}
                                  textToHighlight={questionData?.title || ""}
                                />
                              </h2>
                              <div className='flex justify-between items-center gap-2'>
                                <p className="text-sm text-gray-500">
                                -{questionData?.author.name
                                  .toLowerCase()
                                  .replace(" ", "")}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {questionData?.time_ago}
                            </span>
                              </div>
                              
                            </div>
                            
                          </div>
                          <div className="text-sm secondaryTextColor mb-4">
                            <RichTextContent content={questionData?.description || ""} />
                          </div>
                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <BiShow className="secondaryColor" size={18} /> <span className='font-bold secondaryColor'>{questionData?.views}</span> {t("views")}
                            </span>
                            <span className="flex items-center gap-1">
                              <BiReply className="secondaryColor" size={18} /> <span className='font-bold secondaryColor'>{questionData?.replies_count}</span> {t("replies")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies List Section */}
                    <div className="space-y-6 mb-8 ml-14">
                      {repliesData.length > 0 ? (
                        repliesData.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex gap-3 md:gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0"
                          >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                <CustomImageTag
                                  src={reply.author.avatar || ""}
                                  alt={reply.author.name || ""}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                {/* Author Name and Tag stacked vertically */}
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {reply.author.name}
                                  </span>
                                  {/* <span className="text-[var(--primary-color)] sectionBg px-2 py-0.5 rounded text-xs w-max mt-0.5">
                                    Student
                                  </span> */}
                                </div>
                                {/* Time */}
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2 mt-0.5">
                                  {reply.time_ago}
                                </span>
                              </div>
                              <p className="text-sm secondaryTextColor break-words whitespace-pre-wrap">
                                <Highlighter
                                  highlightClassName="primaryLightBg p-1 primaryColor rounded-md"
                                  searchWords={[query || ""]}
                                  autoEscape={true}
                                  textToHighlight={extractTextFromHTML(reply.reply)}
                                />
                                {/* {reply.reply} */}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">{t("no_replies_yet_be_the_first_to_reply")}</p>
                        </div>
                      )}
                    </div>

                    {/* Show the ReplaySkeleton while loading more replies */}
                    {loadingMoreReplies && (
                      <div>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <ReplySkeleton key={index} />
                        ))}
                      </div>
                    )}

                    {/* Load More Button - Only show if there are more replies and not loading */}
                    {hasInitiallyLoadedReplies && hasMoreReplies && repliesData.length > 0 && (
                      <div className="text-center mb-8">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMoreReplies}
                          className="commonBtn"
                        >
                          {loadingMoreReplies ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {t("loading")}
                            </div>
                          ) : (
                            t("load_more_reply")
                          )}
                        </button>
                      </div>
                    )}

                    {/* Reply Editor Section */}
                    <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
                      <h3 className="text-md font-semibold mb-3 text-gray-800">
                        {t("reply")}
                      </h3>

                      <div className="w-full max-w-full overflow-hidden wrap-break-word ">
                        <ReactQuill
                          value={formData.reply}
                          onChange={(content) => handleInputChange("reply", content)}
                          placeholder={t("e_g_i_dont_understand_your_video_properly")}
                          className="w-full max-w-full break-words "
                        />
                      </div>

                      {errors.reply && <p className="text-red-500 text-sm mt-1">{errors.reply}</p>}
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, reply: "" }))} // Clear editor
                          className="commonBtn shadow text-black bg-transparent hover:bg-gray-100"
                        >
                          {t("cancel_button")}
                        </button>
                        <button
                          onClick={handleSubmitReply}
                          disabled={isLoading} // Only disable when loading, let validation handle empty content
                          className="commonBtn"
                        >
                          {isLoading ? t("submitting") : t("submit")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
