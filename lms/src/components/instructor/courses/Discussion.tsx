"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  BiMessageSquareAdd,
  BiPlusCircle,
  BiSearchAlt,
  BiFlag,
} from "react-icons/bi";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { CourseDetail } from "@/utils/api/instructor/course/getCourseDetails";
// Import discussion API and types
import { getDiscussion, DiscussionDataType, GetDiscussionParams } from "@/utils/api/instructor/discussion/getDiscussion";
import { replyDiscussion, ReplyDiscussionParams } from "@/utils/api/instructor/discussion/replyDiscussion";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/utils/helpers";
import CustomPagination from "../commonCommponents/pagination/CustomPagination";
import DataNotFound from "@/components/commonComp/DataNotFound";
import ReplySkeleton from "@/components/skeletons/help-support/ReplySkeleton";
import { useTranslation } from "@/hooks/useTranslation";

interface DiscussionProps {
  course: CourseDetail;
}

const Discussion: React.FC<DiscussionProps> = ({ course }) => {

  const { t } = useTranslation();

  // Local state for discussions data
  const [discussions, setDiscussions] = useState<DiscussionDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI state
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [totalReplyInput, setTotalReplyInput] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<number | null>(null);

  // Fetch discussions function (similar to fetchAddedCourses)
  const fetchDiscussion = async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    id?: number;
    slug?: string;
    isReply?: boolean;
  }) => {

    setIsLoading(params?.isReply ? false : true);

    try {
      // Build API parameters based on current filters
      const apiParams: GetDiscussionParams = {
        per_page: params?.per_page || rowsPerPage,
        page: params?.page || currentPage,
        id: course.course_details.id, // Always include course ID
        slug: course.course_details.slug, // Always include course slug
      };

      // Add search parameter if provided
      if (params?.search !== undefined) {
        apiParams.search = params.search;
      } else if (searchTerm.trim()) {
        apiParams.search = searchTerm.trim();
      }

      // Fetch discussions with server-side filtering and pagination
      const response = await getDiscussion(apiParams);

      if (response) {
        // Check if API returned an error (error: true in response)
        if (!response.error) {
          if (response.data?.discussions?.data) {
            setDiscussions(response.data.discussions.data);
          }
          // Set pagination data directly from response
          if (response.data?.discussions) {
            setTotalDiscussions(response.data.discussions.total);
            setTotalPages(response.data.discussions.last_page);
          } else {
            setTotalDiscussions(0);
            setTotalPages(0);
          }
        } else {
          console.log("API error:", response.message);
          toast.error(response.message || "Failed to fetch discussions");
          setDiscussions([]);
          setTotalDiscussions(0);
          setTotalPages(0);
        }
      } else {
        console.log("response is null in component", response);
        setDiscussions([]);
        setTotalDiscussions(0);
        setTotalPages(0);
      }
    } catch (error) {
      extractErrorMessage(error);
      setDiscussions([]);
      setTotalDiscussions(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler functions for filters and search (similar to CoursesTable)
  const handleSearchChange = (searchValue: string) => {
    setSearchTerm(searchValue);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDiscussion({ page });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
    fetchDiscussion({ per_page: perPage, page: 1 });
  };

  // Fetch discussions on component mount
  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchDiscussion();
    }
  }, [searchTerm]);

  // Handle search input change with debouncing
  useEffect(() => {
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        fetchDiscussion({ search: searchTerm, page: 1 });
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    handleSearchChange(event.target.value);
  };

  const handleRowsPerPageSelectChange = (value: string): void => {
    handleRowsPerPageChange(parseInt(value, 10));
  };

  // Function to handle adding a reply to a discussion
  const handleAddReply = async () => {
    // Validate reply text
    if (!replyText.trim()) {
      toast.error(t("please_enter_a_reply_message"));
      return;
    }

    // Validate discussion ID
    if (!selectedDiscussionId) {
      toast.error(t("no_discussion_selected_for_reply"));
      return;
    }

    setIsSubmittingReply(true);

    try {
      // Prepare reply parameters
      const replyParams: ReplyDiscussionParams = {
        discussion_id: selectedDiscussionId,
        message: replyText.trim(),
      };

      // Call the reply API
      const response = await replyDiscussion(replyParams);

      if (response && !response.error) {
        // Success - show success message
        toast.success(t("reply_added_successfully"));

        // Clear the reply form
        setReplyText("");
        setShowReplyInput(false);
        setSelectedDiscussionId(null);

        // Refresh the discussions to show the new reply
        await fetchDiscussion({ isReply: true });
      } else {
        // API returned an error
        toast.error(response?.message || "Failed to add reply");
      }
    } catch (error) {
      // Handle network or other errors
      extractErrorMessage(error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Function to handle opening reply input for a specific discussion
  const handleOpenReplyInput = (discussionId: number) => {
    setSelectedDiscussionId(discussionId);
    setShowReplyInput(true);
    setReplyText("");
  };

  // Function to handle canceling reply
  const handleCancelReply = () => {
    setShowReplyInput(false);
    setReplyText("");
    setSelectedDiscussionId(null);
  };

  return (
    <div className="w-full">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-4">
        <h2 className="text-base sm:text-lg font-semibold whitespace-nowrap">
          {t("all_discussion")} ({totalDiscussions})
        </h2>
        <div className="flex items-center w-full sm:w-auto">
          <div className="flex items-center w-full sm:max-w-[320px] bg-white border border-gray-300 rounded-md overflow-hidden h-10">
            <Input
              type="text"
              placeholder={t("search_discussion")}
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full px-3"
            />
            <button className="bg-black text-white h-full px-4 flex items-center justify-center text-sm transition-colors hover:bg-black/90 flex-shrink-0">
              <span className="hidden lg:block mr-2">{t("search")}</span>
              <BiSearchAlt size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Discussion List */}
      <div className="my-4 space-y-4 sectionBg rounded-lg p-3 sm:p-4 mx-3 sm:m-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ReplySkeleton key={index} instructorCourseTab={true} />
          ))
        ) : discussions.length > 0 ? (
          discussions.map((post, index) => (
            <div
              key={post.id}
              className={`p-3 sm:p-6 bg-white rounded-lg ${index === 0 && showReplyInput ? "pb-6" : ""
                }`}
            >
              <div className="flex gap-2 sm:gap-3">
                {/* Avatar */}
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-full">
                  <CustomImageTag
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-full h-full rounded-full"
                  />
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{post.author.name}</h3>
                    <span className="text-sm text-gray-700">
                      {post.time_ago}
                    </span>
                  </div>

                  <p className="mt-2 break-words">{post.message}</p>

                  {/* divider */}
                  <div className="my-3 sm:my-4 border-t border-gray-200"></div>
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      className="flex items-center gap-1 sm:gap-2 text-sm text-gray-700"
                      onClick={() => setTotalReplyInput(!totalReplyInput)}
                    >
                      <BiPlusCircle className="h-4 w-4" />
                      {post.reply_count} {t("reply")}
                    </button>
                    {/* right side divider line */}
                    <div className="hidden sm:block border-r border-gray-200"></div>
                    <button
                      className="flex items-center gap-1 sm:gap-2 text-sm text-gray-700"
                      onClick={() => handleOpenReplyInput(post.id)}
                    >
                      <BiMessageSquareAdd className="h-4 w-4" />
                      {t("add_reply")}
                    </button>
                    {/* divider */}
                    {/* <div className="hidden sm:block border-r border-gray-200"></div>
                    <button
                      className="flex items-center gap-1 sm:gap-2 text-sm text-gray-700"
                    >
                      <BiFlag className="h-4 w-4" />
                      {t("flag")}
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Reply Input Area - Only shown when reply is clicked for this specific discussion */}
              {showReplyInput && selectedDiscussionId === post.id && (
                <div className="mt-4 sm:mt-6 ml-2 sm:ml-12">
                  <div className="sectionBg p-3 sm:p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">{t("reply")}</h3>
                    <textarea
                      placeholder={t("write_reply")}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2 border border-gray-200 bg-white rounded-md text-sm min-h-[80px] resize-none"
                      disabled={isSubmittingReply}
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      <Button
                        variant="link"
                        onClick={handleCancelReply}
                        className="min-w-[75px] h-[36px] text-[#000000] hover:no-underline py-[6px] px-[12px] gap-[4px] rounded-[4px] font-medium"
                        disabled={isSubmittingReply}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleAddReply}
                        className="min-w-[54px] h-[36px] bg-[#000000] text-white hover:bg-[#000000]/80 py-[6px] px-[12px] gap-[4px] rounded-[4px] font-medium"
                        disabled={isSubmittingReply || !replyText.trim()}
                      >
                        {isSubmittingReply ? t("adding") + "..." : t("add")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply List */}
              {totalReplyInput && post.replies && post.replies.length > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 ml-2 sm:ml-12 border-t border-gray-200">
                  <div className="space-y-2">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-2 rounded-md border-b border-gray-200 !pb-4 sm:!pb-5"
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Avatar */}
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-full">
                            <CustomImageTag
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="w-full h-full rounded-full"
                            />
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-xs sm:text-sm">
                                {reply.author?.name || "-"}
                              </h3>
                              <span className="text-sm text-gray-700">
                                {reply.time_ago || reply.timestamp}
                              </span>

                              <p className="mt-1 sm:mt-2 break-words">
                                {reply.message || reply.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <DataNotFound />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-gray-200">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalDiscussions}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageSelectChange}
            showResultText={true}
          />
        </div>
      )}
    </div>
  );
};

export default Discussion;
