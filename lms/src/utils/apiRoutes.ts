export const getFeatureSectionsApiRoute = "/get-feature-sections";

export const mobileLoginApiRoute = "/mobile-login";
export const mobileResetPasswordApiRoute = "/mobile-reset-password";
export const mobileRegistrationApiRoute = "/mobile-registration";
export const userExistsApiRoute = "/user-exists";
export const userSignupApiRoute = "/user-signup";
export const promoCodeApiRoute = "/promo-code";
export const changePasswordApiRoute = "/change-password";
export const downloadInvoiceApiRoute = "/download-invoice";
export const helpdeskGroupsApiRoute = "/helpdesk/groups";
export const helpdeskCheckGroupApprovalApiRoute = "/helpdesk/check-group-approval";
export const helpdeskGroupsRequestApiRoute = "/helpdesk/groups/request";
export const helpdeskQuestionDetailsApiRoute = "/helpdesk/question";
export const helpdeskQuestionsApiRoute = "/helpdesk/questions";
export const helpdeskQuestionReplyApiRoute = "/helpdesk/question/reply";
export const helpdeskSearchApiRoute = "/helpdesk/search";
export const certificateCourseDownloadApiRoute = "/certificate/course/download";
export const discussionCourseApiRoute = "/discussion/course";
export const placeOrderApiRoute = "/place_order";
export const ratingAddApiRoute = "/rating/add";
export const ratingDeleteApiRoute = "/rating/delete";
export const applyPromoCodeApiRoute = "/promo-code/apply-promo-code";
export const clearCartApiRoute = "/cart/clear";
export const contactUsApiRoute = "/contact-us";
export const courseViewApiRoute = "/course-view";
export const categoriesApiRoute = "/categories";
export const categoryTreeApiRoute = "/categories-tree";
export const getCountsApiRoute = "/get-counts";
export const getCourseApiRoute = "/get-course";
export const getCourseCouponsApiRoute = "/list";
export const getCourseReviewsApiRoute = "/get-course-reviews";
export const getCoursesApiRoute = "/get-courses";
export const faqsApiRoute = "/faqs";
export const getInstructorReviewsApiRoute = "/get-instructor-reviews";
export const getInstructorsApiRoute = "/get-instructors";
export const ordersApiRoute = "/orders";
export const getResourcesApiRoute = "/get-resources";
export const getSearchSuggestionsApiRoute = "/get-search-suggestions";
export const getSliderApiRoute = "/get-sliders";
export const getUserDetailsApiRoute = "/get-user-details";
export const myLearningApiRoute = "/my-learning";
export const billingDetailsApiRoute = "/billing-details";
export const deleteAccountApiRoute = "/delete-account";
export const cartAddApiRoute = "/cart/add";
export const cartApplyPromoApiRoute = "/cart/apply-promo";
export const getCartApiRoute = "/cart";
export const cartRemovePromoApiRoute = "/cart/remove-promo";
export const cartRemoveApiRoute = "/cart/remove";
export const courseCompletionApiRoute = "/curriculum/course-completion";
export const curriculumMarkCompleteApiRoute = "/curriculum/mark-completed";
export const assignmentSubmitApiRoute = "/assignments/submit";
export const assignmentSubmissionApiRoute = "/assignments/submission";
export const getAssignmentsApiRoute = "/get-assignments";
export const purchaseCertificateApiRoute = "/purchase-certificate";
export const quizFinishApiRoute = "/quiz/finish";
export const quizAnswerApiRoute = "/quiz/answer";
export const quizSummaryApiRoute = "/quiz/summary";
export const quizStartApiRoute = "/quiz/start";
export const refundRequestApiRoute = "/refund/request";
export const myRefundsApiRoute = "/refund/my-refunds";
export const notificationsMarkAllReadApiRoute = "/notifications/mark-all-read";
export const notificationsMarkReadApiRoute = "/notifications/mark-read";
export const switchInstructorTypeApiRoute = "/switch-instructor-type";
export const acceptTeamInvitationApiRoute = "/accept-team-invitation";
export const walletWithdrawalRequestApiRoute = "/wallet/withdrawal-request";
export const walletHistoryApiRoute = "/wallet/history";
export const wishlistAddUpdateApiRoute = "/wishlist/add-update-wishlist";
export const wishlistApiRoute = "/wishlist";

// General API Routes
export const getCourseLanguagesApiRoute = "/get-course-languages";
export const getCustomFieldsApiRoute = "/get-custom-form-fields";
export const getPagesApiRoute = "/pages";
export const getSeoSettingsApiRoute = "/seo-settings";
export const getSettingsApiRoute = "/web-settings";
export const updateProfileApiRoute = "/update-profile";

// Instructor API Routes
export const updateInstructorDetailsApiRoute = "/instructor/update-details";
export const getCategoriesApiRoute = "/get-categories";
export const getCourseDetailsApiRoute = "/get-course-details";
export const getCurriculumDetailsApiRoute = "/course-chapters/particular-curriculum/details";
export const getCourseEnrollStudentsApiRoute = "/get-course-enrolled-students";
export const getAddedCoursesApiRoute = "/get-added-courses";
export const getMostSellingCoursesApiRoute = "/get-most-selling-courses";
export const getQuizReportDetailsApiRoute = "/get-quiz-report-details";
export const getQuizResultDetailsApiRoute = "/get-quiz-result-details";
export const getQuizReportsApiRoute = "/get-quiz-reports";
export const assignmentSubmissionsApiRoute = "/assignment-submissions";
export const getAssignmentsListApiRoute = "/get-assignments-list";
export const editAssignmentSubmissionApiRoute = "/edit-assignment-submission";
export const promoCodesApiRoute = "/promo-codes";
export const addPromoCodeApiRoute = "/add-promo-code";
export const getCoursesForCouponApiRoute = "/get-courses-for-coupon";
export const getInstructorDashboardApiRoute = "/get-instructor-dashboard";
export const invitorsApiRoute = "/invitors";
export const teamMembersApiRoute = "/team-members";
export const addTeamMemberApiRoute = "/add-team-member";
export const removeTeamMemberApiRoute = "/remove-team-member";
export const withdrawalRequestApiRoute = "/finance/withdrawal-request";
export const courseAnalysisApiRoute = "/course-analysis";
export const earningsApiRoute = "/earnings";
export const withdrawalHistoryApiRoute = "/withdrawal-history";
export const refundRequestsApiRoute = "/refund-requests";
export const getAddedCourseChaptersApiRoute = "/get-added-course-chapters";
export const getTagsApiRoute = "/get-tags";
export const getDiscussionApiRoute = "/get-discussion";
export const replyDiscussionApiRoute = "/reply-discussion";
export const notificationsApiRoute = "/notifications";
export const getCourseRevenueApiRoute = "/get-course-revenue";
export const getCourseRevenueDetailsApiRoute = "/get-course-revenue-details";
export const getReviewsApiRoute = "/get-reviews";

// Instructor Course Management Routes
export const updateCourseApiRoute = "/update-course";
export const deleteCourseApiRoute = "/delete-course";
export const createCourseApiRoute = "/create-course";
export const updateCourseStatusApiRoute = "/update-course-status";

// Instructor Course Chapters & Curriculum Routes
export const createCourseChapterApiRoute = "/create-course-chapter";
export const updateCourseChapterApiRoute = "/update-course-chapter";
export const deleteCourseChapterApiRoute = "/delete-course-chapter";
export const createChaptersApiRoute = "/create-chapters"; // Plural? Let's check
export const courseChaptersCurriculumApiRoute = "/course-chapters/curriculum";
export const courseChaptersCurriculumListApiRoute = "/course-chapters/curriculum/list";
export const courseChaptersCurriculumDestroyApiRoute = "/course-chapters/curriculum/destroy";
export const createCurriculumApiRoute = "/create-curriculum";
export const updateCurriculumOrderApiRoute = "/update-curriculum-order";
export const courseChaptersCurriculumUpdateOrderApiRoute = "/course-chapters/curriculum/update-order";
export const courseChaptersCurriculumAssignmentUpdateApiRoute = "/course-chapters/curriculum/assignment/update";
export const courseChaptersCurriculumLectureUpdateApiRoute = "/course-chapters/curriculum/lecture/update";
export const courseChaptersCurriculumResourceUpdateApiRoute = "/course-chapters/curriculum/resource/update";

// Instructor Quiz Routes
export const courseChaptersQuizQuestionsListApiRoute = "/course-chapters/quiz/questions/list";
export const courseChaptersCurriculumQuizGetQuestionApiRoute = "/course-chapters/curriculum/quiz/get-question";
export const courseChaptersCurriculumQuizAddQuestionApiRoute = "/course-chapters/curriculum/quiz/add-question";
export const courseChaptersCurriculumQuizUpdateApiRoute = "/course-chapters/curriculum/quiz/update";
export const courseChaptersCurriculumQuizUpdateQuestionApiRoute = "/course-chapters/curriculum/quiz/update-question";
export const courseChaptersCurriculumQuizDeleteQuestionApiRoute = "/course-chapters/curriculum/quiz/delete-question";

// Promo Code Management (Additional)
export const deletePromoCodeApiRoute = "/promo-code";
export const editPromoCodeApiRoute = "/edit-promo-code";

// Language Routes
export const systemLanguagesApiRoute = "/system-languages";

export const upload = "/upload";

// Chunked Video Upload Route (Resumable)
export const curriculumLectureUploadApiRoute = "/curriculum/lecture/upload";

