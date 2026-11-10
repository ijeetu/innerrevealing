// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { AssignmentTabDataType, CurriculumTabDataType, LectureTabDataType, QuizTabDataType, ResourcesTabDataType } from '@/types/instructorTypes/instructorTypes'

// Initial state with some default data
const initialState: CurriculumTabDataType = {
    chapterId: null as number | null,
    type: "",
    isCurriculumCreated: false,
    lectureData: {
        lectureTitle: "",
        lectureDescription: "",
        lectureHours: "0",
        lectureMinutes: "0",
        lectureSeconds: "0",
        lectureFreePreview: "",
        lectureType: "",
        lectureUrl: "",
        lectureFile: null as File | string | null,
        lectureYoutubeUrl: "",
        resources: [] as ResourcesTabDataType[],
    },
    quizData: {
        quiz_title: "",
        quiz_total_points: 0,
        quiz_passing_score: 0,
        quiz_can_skip: false,
    },
    assignmentData: {
        assignment_title: "",
        assignment_submission_date: "",
        assignment_short_description: "",
        assignment_media: null as File | null | string,
        assignment_allowed_file_types: [],
        assignment_can_skip: false,
        assignment_points: 0 as number,
        media_url: "",
    },
    resourcesData: {
        id: null,
        resource_type: '',
        resource_title: '',
        resource_short_description: '',
        resource_file: null,
        resource_duration: 0,
    },

}


// Create a Redux slice
export const curriculamSlice = createSlice({
    name: 'curriculam',
    initialState,
    reducers: {
        setIsCurriculumCreated: (state, action: PayloadAction<boolean>) => {
            state.isCurriculumCreated = action.payload;
        },
        setCurriculamData: (state, action: PayloadAction<Partial<CurriculumTabDataType>>) => {
            state.chapterId = action.payload.chapterId as number | null;
            state.type = action.payload.type as string;
        },
        setLectureData: (state, action: PayloadAction<Partial<LectureTabDataType>>) => {
            state.lectureData = {
                ...state.lectureData as LectureTabDataType,
                ...action.payload,
            };
        },
        setQuizData: (state, action: PayloadAction<Partial<QuizTabDataType>>) => {
            state.quizData = {
                ...state.quizData as QuizTabDataType,
                ...action.payload,
            };
        },
        setAssignmentData: (state, action: PayloadAction<Partial<AssignmentTabDataType>>) => {
            state.assignmentData = {
                ...state.assignmentData as AssignmentTabDataType,
                ...action.payload,
            };
        },
        setResourcesData: (state, action: PayloadAction<Partial<ResourcesTabDataType>>) => {
            state.resourcesData = {
                ...state.resourcesData as ResourcesTabDataType,
                ...action.payload,
            };
        },
        resetCurriculamData: () => {
            return initialState
        },
        resetLectureData: (state) => {
            state.lectureData = initialState.lectureData
        },
        resetQuizData: (state) => {
            state.quizData = initialState.quizData
        },
        resetAssignmentData: (state) => {
            state.assignmentData = initialState.assignmentData
        },
        resetResourcesData: (state) => {
            state.resourcesData = initialState.resourcesData
        }
    },
})

// Export actions
export const {
    setIsCurriculumCreated,
    setCurriculamData,
    setLectureData,
    setQuizData,
    setAssignmentData,
    setResourcesData,
    resetCurriculamData,
    resetLectureData,
    resetQuizData,
    resetAssignmentData,
    resetResourcesData,
} = curriculamSlice.actions

// Export reducer
export default curriculamSlice.reducer

// Selectors
export const dataSelector = (state: RootState) => state.curriculam

export const curriculamDataSelector = createSelector(
    dataSelector,
    state => state
)

export const isCurriculumCreatedSelector = createSelector(
    dataSelector,
    state => state.isCurriculumCreated
)

export const lectureDataSelector = createSelector(
    dataSelector,
    state => state.lectureData
)

export const quizDataSelector = createSelector(
    dataSelector,
    state => state.quizData
)

export const assignmentDataSelector = createSelector(
    dataSelector,
    state => state.assignmentData
)

export const resourcesDataSelector = createSelector(
    dataSelector,
    state => state.resourcesData
)
