// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { CurriculumItem } from '@/utils/api/user/getCourse'

// Initial state with some default data
const initialState = {
    showTopHeader: true as boolean,
    isLoginModalOpen: false as boolean,
    createdCourseId: null as number | null,
    isEditCurriculum: null as 'lecture' | 'quiz' | 'assignment' | 'resources' | null,
    lectureTypeId: null as number | null,
    quizQuestionId: null as number | null,
    isLessonAddedOnce: false as boolean,
    isUpdateFile: {
        courseThumbnail: false as boolean,
        coursePreviewVideo: false as boolean,
        curriculum: false as boolean,
    },
    instructorWithdrawal: {
        totalwithdrawal: null as string | null,
        availableToWithdrawal: null as string | null,
    },
    isCartPromoApplied: false as boolean,
    isInstructorFromResubmit: false as boolean,
    // LessonOverview states starts here
    currentCourseId: null as number | null,
    currentCurriculumId: null as number | null,
    selectedCurriculumItem: null as CurriculumItem | null,
    selectedCurriculumChapterId: null as number | null,
    isCurriculumItemCompleted: {
        completed: false as boolean,
        itemId: null as number | null,
        isNextItem: false as boolean,
    },
    isPayingForCertificate: false as boolean,
    previouslyCompletedCurriculumsIds: null as number[] | null,
    shouldRefetchOrders: false as boolean,
    fetchUserDeatils: false as boolean,
    userBillingDetails: false as boolean,
    enrollingCourseSlug: null as string | null,
    instructorNotificationStatus: false as boolean,
    skipAssignment: false as boolean,
    // LessonOverview states ends here
}

// Create a Redux slice
export const helpersSlice = createSlice({
    name: 'helpers',
    initialState,
    reducers: {
        setShowTopHeader: (state, action: PayloadAction<boolean>) => {
            state.showTopHeader = action.payload
        },
        setIsLoginModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isLoginModalOpen = action.payload
        },
        setCreatedCourseId: (state, action: PayloadAction<number | null>) => {
            state.createdCourseId = action.payload
        },
        setIsEditCurriculum: (state, action: PayloadAction<'lecture' | 'quiz' | 'assignment' | 'resources' | null>) => {
            state.isEditCurriculum = action.payload
        },
        setLectureTypeId: (state, action: PayloadAction<number | null>) => {
            state.lectureTypeId = action.payload
        },
        setQuizQuestionId: (state, action: PayloadAction<number | null>) => {
            state.quizQuestionId = action.payload
        },
        setIsLessonAddedOnce: (state, action: PayloadAction<boolean>) => {
            state.isLessonAddedOnce = action.payload
        },
        setIsUpdateFile: (state, action: PayloadAction<{
            courseThumbnail?: boolean,
            coursePreviewVideo?: boolean,
            curriculum?: boolean,
        }>) => {
            state.isUpdateFile = {
                ...state.isUpdateFile,
                ...action.payload,
            }
        },
        resetHelpersData: () => {
            return initialState
        },
        setInstructorWithdrawal: (state, action: PayloadAction<{
            totalwithdrawal?: string | null,
            availableToWithdrawal?: string | null,
        }>) => {
            state.instructorWithdrawal = {
                ...state.instructorWithdrawal,
                ...action.payload,
            }
        },
        setCurrentCourseId: (state, action: PayloadAction<number | null>) => {
            state.currentCourseId = action.payload
        },
        setCurrentCurriculumId: (state, action: PayloadAction<number | null>) => {
            state.currentCurriculumId = action.payload
        },
        setSelectedCurriculumItem: (state, action: PayloadAction<CurriculumItem | null>) => {
            state.selectedCurriculumItem = action.payload
        },
        setSelectedCurriculumChapterId: (state, action: PayloadAction<number | null>) => {
            state.selectedCurriculumChapterId = action.payload
        },
        setIsCurriculumItemCompleted: (state, action: PayloadAction<{
            completed?: boolean,
            itemId?: number | null,
            isNextItem?: boolean,
        }>) => {
            state.isCurriculumItemCompleted = {
                ...state.isCurriculumItemCompleted,
                ...action.payload,
            }
        },
        setPreviouslyCompletedCurriculumsIds: (state, action: PayloadAction<number[] | null>) => {
            state.previouslyCompletedCurriculumsIds = action.payload
        },
        setIsPayingForCertificate: (state, action: PayloadAction<boolean>) => {
            state.isPayingForCertificate = action.payload
        },
        resetCourseRelatedData: (state) => {
            state.createdCourseId = null
            state.isEditCurriculum = null
            state.lectureTypeId = null
            state.quizQuestionId = null
            state.isLessonAddedOnce = false
            state.isUpdateFile = {
                courseThumbnail: false,
                coursePreviewVideo: false,
                curriculum: false,
            }
        },
        setIsCartPromoApplied: (state, action: PayloadAction<boolean>) => {
            state.isCartPromoApplied = action.payload
        },
        setIsInstructorFromResubmit: (state, action: PayloadAction<boolean>) => {
            state.isInstructorFromResubmit = action.payload
        },
        resetLessonOverviewData: (state) => {
            state.currentCourseId = null;
            state.currentCurriculumId = null;
            state.selectedCurriculumItem = null;
            state.selectedCurriculumChapterId = null;
            state.isCurriculumItemCompleted = {
                completed: false,
                itemId: null,
                isNextItem: false
            };
            state.isPayingForCertificate = false;
            state.previouslyCompletedCurriculumsIds = null;
        },
        setShouldRefetchOrders: (state, action: PayloadAction<boolean>) => {
            state.shouldRefetchOrders = action.payload
        },
        setFetchUserDeatils: (state, action: PayloadAction<boolean>) => {
            state.fetchUserDeatils = action.payload
        },
        setUserBillingDetails: (state, action: PayloadAction<boolean>) => {
            state.userBillingDetails = action.payload
        },
        setEnrollingCourseSlug: (state, action: PayloadAction<string | null>) => {
            state.enrollingCourseSlug = action.payload
        },
        setInstructorNotificationStatus: (state, action: PayloadAction<boolean>) => {
            state.instructorNotificationStatus = action.payload
        },
        setSkipAssignment: (state, action: PayloadAction<boolean>) => {
            state.skipAssignment = action.payload
        },

    }
})

export const { setShowTopHeader, setIsLoginModalOpen, setCreatedCourseId, setIsEditCurriculum, setLectureTypeId, setQuizQuestionId, setIsLessonAddedOnce, setIsUpdateFile, resetHelpersData, setInstructorWithdrawal, setSelectedCurriculumItem, setSelectedCurriculumChapterId, setIsCurriculumItemCompleted, resetCourseRelatedData, setCurrentCurriculumId, setIsCartPromoApplied, setIsInstructorFromResubmit, setPreviouslyCompletedCurriculumsIds, setCurrentCourseId, resetLessonOverviewData, setShouldRefetchOrders, setFetchUserDeatils, setUserBillingDetails, setEnrollingCourseSlug, setInstructorNotificationStatus, setSkipAssignment } = helpersSlice.actions

export default helpersSlice.reducer

export const dataSelector = (state: RootState) => state.helpers

export const showTopHeaderSelector = createSelector(dataSelector, state => state.showTopHeader)
export const isLoginModalOpenSelector = createSelector(dataSelector, state => state.isLoginModalOpen)
export const createdCourseIdSelector = createSelector(dataSelector, state => state.createdCourseId)
export const isEditCurriculumSelector = createSelector(dataSelector, state => state.isEditCurriculum)
export const lectureTypeIdSelector = createSelector(dataSelector, state => state.lectureTypeId)
export const quizIdSelector = createSelector(dataSelector, state => state.quizQuestionId)
export const isLessonAddedOnceSelector = createSelector(dataSelector, state => state.isLessonAddedOnce)
export const isUpdateFileSelector = createSelector(dataSelector, state => state.isUpdateFile)
export const instructorWithdrawalDetailsSelector = createSelector(dataSelector, state => state.instructorWithdrawal)
export const selectedCurriculumItemSelector = createSelector(dataSelector, state => state.selectedCurriculumItem)
export const selectedCurriculumChapterIdSelector = createSelector(dataSelector, state => state.selectedCurriculumChapterId)
export const isCurriculumItemCompletedSelector = createSelector(dataSelector, state => state.isCurriculumItemCompleted)
export const currentCurriculumIdSelector = createSelector(dataSelector, state => state.currentCurriculumId)
export const isPayingForCertificateSelector = createSelector(dataSelector, state => state.isPayingForCertificate)
export const isCartPromoAppliedSelector = createSelector(dataSelector, state => state.isCartPromoApplied)
export const isInstructorFromResubmitSelector = createSelector(dataSelector, state => state.isInstructorFromResubmit)
export const previouslyCompletedCurriculumsIdsSelector = createSelector(dataSelector, state => state.previouslyCompletedCurriculumsIds);
export const currentCourseIdSelector = createSelector(dataSelector, state => state.currentCourseId);
export const shouldRefetchOrdersSelector = createSelector(dataSelector, state => state.shouldRefetchOrders);
export const fetchUserDeatilsSelector = createSelector(dataSelector, state => state.fetchUserDeatils);
export const userBillingDetailsSelector = createSelector(dataSelector, state => state.userBillingDetails);
export const enrollingCourseSlugSelector = createSelector(dataSelector, state => state.enrollingCourseSlug);
export const instructorNotificationStatusSelector = createSelector(dataSelector, state => state.instructorNotificationStatus);
export const skipAssignmentSelector = createSelector(dataSelector, state => state.skipAssignment);