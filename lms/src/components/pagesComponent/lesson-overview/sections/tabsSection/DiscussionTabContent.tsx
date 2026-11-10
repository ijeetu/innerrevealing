"use client";
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FiPlusCircle } from "react-icons/fi";
import { LuSquarePlus } from 'react-icons/lu';
import { BiMessageSquareAdd } from "react-icons/bi";
import ReplyForm from './ReplyForm';
import CommentThread from './CommentThread';
import { BiSend } from 'react-icons/bi';
import { postCourseDiscussion } from '@/utils/api/user/lesson-overview/discussion/courseDiscussion';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { DiscussionMessage, getCourseDiscussion } from '@/utils/api/user/lesson-overview/discussion/getCourseDiscussion';
import { extractErrorMessage } from '@/utils/helpers';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';
import DiscussionSkeleton from '@/components/skeletons/lesson-overview/DiscussionSkeleton';
import DiscussionTopicSkeleton from '@/components/skeletons/lesson-overview/DiscussionTopicSkeleton';
import DataNotFound from '@/components/commonComp/DataNotFound';
import { useTranslation } from '@/hooks/useTranslation';

// Define a type for form errors
type FormErrors = {
  course_id?: string;
  message?: string;
};

interface DiscussionTabContentProps {
  courseId: number;
}

const DiscussionTabContent: React.FC<DiscussionTabContentProps> = ({ courseId }) => {

  const { t } = useTranslation();

  // Define Zod schema for discussion form validation
  const discussionFormSchema = z.object({
    course_id: z.number().min(1, t("course_id_required")),
    message: z.string().min(1, t("discussion_message_required")).max(1000, t("discussion_message_cannot_exceed_1000_characters")),
  })

  const [searchQuery, setSearchQuery] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState<number | null>(null);
  const [showingCommentsForPostId, setShowingCommentsForPostId] = useState<number | null>(null);
  const [shwoAskQuestionForm, setShwoAskQuestionForm] = useState<boolean>(false);

  // State for the discussion form - discussion/course -> api
  const [questionText, setQuestionText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // State for the discussion messages - /get-course-discussion api
  const [discussionMessages, setDiscussionMessages] = useState<DiscussionMessage[]>([]);
  const [totalDiscussionMessages, setTotalDiscussionMessages] = useState<number>(0);
  const [isLoadingDiscussionMessages, setIsLoadingDiscussionMessages] = useState<boolean>(false);

  // Pagination state for load more functionality
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // This function validates the form data against the Zod schema and sets error states
  const validateForm = (): boolean => {
    try {
      // Validate form data with Zod schema
      discussionFormSchema.parse({ course_id: courseId, message: questionText });

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

  const refreshDiscussionMessages = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      // Fetch all pages that the user has already loaded (1 → currentPage)
      const allMessages: DiscussionMessage[] = [];

      for (let page = 1; page <= currentPage; page++) {
        const response = await getCourseDiscussion({
          course_id: courseId,
          per_page: 5,
          page,
          search: searchQuery,
        });

        if (response && !response.error && response.data?.data) {
          allMessages.push(...response.data.data);

          // Update total from the last page response
          if (page === currentPage) {
            setTotalDiscussionMessages(response.data.total);
            const totalPages = Math.ceil(response.data.total / 5);
            setHasMore(currentPage < totalPages);
          }
        }
      }

      setDiscussionMessages(allMessages);
    } catch (error) {
      extractErrorMessage(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle form submission for asking a question
  const handleSubmitQuestion = async () => {

    // Prevent double submit
    if (isLoading) return;

    // Validate form data using Zod
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare discussion data for API
      const discussionData = {
        course_id: courseId,
        message: questionText.trim()
      };



      // Call the API to post the discussion
      const response = await postCourseDiscussion(discussionData);

      // Check if the API response indicates success
      if (response.success) {
        // Show success message
        toast.success(response.message || "Question posted successfully!");

        // Reset form and close the form
        setQuestionText('');
        setErrors({});
        setShwoAskQuestionForm(false);
        // Reset pagination and refresh discussion list
        setCurrentPage(1);
        await getDiscussionMessages(1, false)
      } else {
        // Handle API error response
        toast.error(response.message || 'Failed to post question');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('Error posting question:', error);
      toast.error(error.message || 'Failed to post question');
    } finally {
      setIsLoading(false);
    }
  };


  // function to fetch discussion messages with pagination support
  const getDiscussionMessages = async (page: number = 1, loadMore: boolean = false) => {
    try {
      // Set appropriate loading state based on whether we're loading more or initial load
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setIsLoadingDiscussionMessages(true);
      }

      const response = await getCourseDiscussion({
        course_id: courseId,
        per_page: 5,
        page: page,
        search: searchQuery
      });

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.data) {
            const discussionData = response.data.data;

            if (loadMore) {
              // Append new messages to existing ones for load more
              setDiscussionMessages(prev => [...prev, ...discussionData]);
            } else {
              // Replace messages for initial load or refresh
              setDiscussionMessages(discussionData);
            }

            // Update total count
            setTotalDiscussionMessages(response.data.total);

            // Check if there are more pages
            const totalPages = Math.ceil(response.data.total / 5);
            setHasMore(page < totalPages);
          } else {
            if (!loadMore) {
              setDiscussionMessages([]);
            }
            setHasMore(false);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch discussion messages");

          if (!loadMore) {
            setDiscussionMessages([]);
          }
          setHasMore(false);
        }
      } else {
        console.log("response is null in component", response);
        toast.error("Failed to fetch discussion messages");

        if (!loadMore) {
          setDiscussionMessages([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      extractErrorMessage(error);
      if (!loadMore) {
        setDiscussionMessages([]);
      }
      setHasMore(false);
    } finally {
      // Reset appropriate loading state
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setIsLoadingDiscussionMessages(false);
      }
    }
  }

  // useEffect to fetch discussion messages
  useEffect(() => {
    if (courseId && searchQuery.trim() === '') {
      getDiscussionMessages();
    }
  }, [courseId, searchQuery]);

  // Load more discussion messages function
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getDiscussionMessages(nextPage, true);
    }
  };


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        getDiscussionMessages();
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);


  const handleToggleReply = (postId: number) => {
    setReplyingToPostId(replyingToPostId === postId ? null : postId);
  };

  // function for discussion reply
  const handleSubmitReply = async (postId: number, replyText: string) => {
    // Prevent double submit
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Prepare reply data for API - using parent_id to link to the original discussion
      const replyData = {
        course_id: courseId,
        message: replyText.trim(),
        parent_id: postId
      };

      // Call the API to post the reply
      const response = await postCourseDiscussion(replyData);

      // Check if the API response indicates success
      if (response.success) {
        // Show success message
        toast.success(response.message || "Reply posted successfully!");

        // Close the reply form
        // setReplyingToPostId(null);

        // Refresh discussion messages to show the new reply
        // setCurrentPage(1);
        // await getDiscussionMessages(1, false);
        await refreshDiscussionMessages()
      } else {
        // Handle API error response
        toast.error(response.error || response.message || 'Failed to post reply');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('Error posting reply:', error);
      toast.error(error.message || 'Failed to post reply');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingToPostId(null);
  };

  const handleToggleComments = (postId: number) => {
    setShowingCommentsForPostId(showingCommentsForPostId === postId ? null : postId);
  };

  return (
    <>
      {isLoadingDiscussionMessages ? (
        <DiscussionSkeleton />
      ) : (
        <div className="p-4 md:p-8">
          {/* Header with search and ask button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h2 className="text-lg font-medium">{t("all_discussion")} ({totalDiscussionMessages || 0})</h2>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
              <div className="flex items-center justify-between w-full h-full sm:w-64 border rounded pl-2 text-sm overflow-hidden">
                <input
                  type="text"
                  placeholder={t("search_discussion")}
                  className="w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button className="bg-black text-white p-3" title="Search discussions">
                  <FaSearch size={16} />
                </button>
              </div>

              <button
                onClick={() => setShwoAskQuestionForm(!shwoAskQuestionForm)}
                className="bg-black text-white px-4 py-[10.7px] rounded text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
                <span className="text-lg"><BiMessageSquareAdd /></span>
                {t("ask_question")}
              </button>
            </div>
          </div>

          {/* Discussion Topic Form */}
          {shwoAskQuestionForm && (
            <div className="sectionBg p-4 md:p-6 rounded-lg mb-6">
              <h3 className="text-md font-semibold mb-3 text-gray-800">
                {t("discussion_topic")}
              </h3>

              <textarea
                placeholder="e.g I don't understand your video properly..."
                className={`w-full p-3 bg-white border border-gray-300 rounded-md min-h-[130px] ${errors.message ? 'border-red-500' : ''}`}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                disabled={isLoading}
              >
              </textarea>

              {/* Display validation errors */}
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShwoAskQuestionForm(false);
                    setQuestionText('');
                    setErrors({});
                  }}
                  className="bg-transparent text-gray-700 md:text-lg lg:text-xl"
                  disabled={isLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSubmitQuestion}
                  disabled={isLoading}
                  className="commonBtn flexCenter gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t("publishing") : t("publish")} <BiSend size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Discussion posts */}
          <div className="space-y-4 sectionBg p-4 rounded-2xl">
            {discussionMessages.length > 0 ? (
              discussionMessages.map(discussionMessage => (
                <div key={discussionMessage.id} className="bg-white p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    {/* User avatar */}
                    <div className="w-10 h-10 rounded-full secondaryTextColor overflow-hidden flex-shrink-0">
                      <CustomImageTag src={discussionMessage.user.profile} alt={discussionMessage.user.name} className="w-full h-full rounded-full" />
                    </div>

                    <div className="flex-1">
                      {/* User info and timestamp */}
                      <div className="flex gap-2 mb-3 flex-col">
                        <h3 className="font-medium text-sm">{discussionMessage.user.name}</h3>
                        <span className="text-xs secondaryTextColor opacity-75">{discussionMessage.time_ago}</span>
                      </div>

                      {/* Post content */}
                      <p className="text-sm mb-3 border-b secondaryTextColor  borderColor pb-3">{discussionMessage.message}</p>

                      {/* Actions */}
                      <div className="flex gap-4 max-321:hidden ">
                        <button
                          className="flex items-center gap-1 text-sm secondaryTextColor opacity-75"
                          onClick={() => handleToggleComments(discussionMessage.id)}
                        >
                          <FiPlusCircle className="" size={14} />
                          <span>{discussionMessage.replies?.length || 0} {t("reply")}</span>
                        </button>

                        <div className='border borderColor'></div>

                        <button
                          className="flex items-center gap-1 text-sm secondaryTextColor opacity-75"
                          onClick={() => handleToggleReply(discussionMessage.id)}
                        >
                          <LuSquarePlus className="" size={14} />
                          <span>{t("add_reply")}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                  <div className="flex gap-4 max-321:flex hidden">
                    <button
                      className="flex items-center gap-1 text-sm secondaryTextColor opacity-75"
                      onClick={() => handleToggleComments(discussionMessage.id)}
                    >
                      <FiPlusCircle className="" size={14} />
                      <span>{discussionMessage.replies?.length || 0} {t("reply")}</span>
                    </button>

                    <div className='border borderColor'></div>

                    <button
                      className="flex items-center gap-1 text-sm secondaryTextColor opacity-75"
                      onClick={() => handleToggleReply(discussionMessage.id)}
                    >
                      <LuSquarePlus className="" size={14} />
                      <span>{t("add_reply")}</span>
                    </button>
                  </div>

                  {/* Comment thread */}
                  {showingCommentsForPostId === discussionMessage.id && discussionMessage.replies && discussionMessage.replies.length > 0 && (
                    <CommentThread replies={discussionMessage.replies} />
                  )}

                  {/* Reply form */}
                  {replyingToPostId === discussionMessage.id && (
                    <div className="mt-4 md:ml-12 max-321:ml-0">
                      <ReplyForm
                        onCancel={handleCancelReply}
                        onSubmit={(replyText) => handleSubmitReply(discussionMessage.id, replyText)}
                        isLoading={isLoading}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <DataNotFound />
            )}
          </div>

          {loadingMore && (
            <div>
              {Array.from({ length: 3 }).map((_, index) => (
                <DiscussionTopicSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="commonBtn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? t("loading") : t("load_more")}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default DiscussionTabContent
