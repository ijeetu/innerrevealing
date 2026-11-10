// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AddCourseDataType, CourseDetailsDataType, requirements, whatYoullLearn } from '@/types/instructorTypes/instructorTypes'

// Initial state with some default data
const initialState: AddCourseDataType = {
    courseDetailsData: {
        title: '',
        shortDescription: '',
        categoryId: '',
        difficultyLevel: '',
        languageId: '',
        courseTag: [] as string[],
        whatYoullLearn: [] as whatYoullLearn[], // Initialize with one empty string
        requirements: [] as requirements[], // Initialize with one empty string
        instructor: [] as number[],
        metaTag: '',
        metaTitle: '',
        metaDescription: '',
        thumbnail: null as File | null,
        video: null as File | null,
        price: null,
        discount: null,
        isFree: false,
        isSequentialAccess: false,
        certificateEnabled: false,
        certificateAmount: null,
        status: 'draft',
    },
    isLessonAdded: false,
}


// Create a Redux slice
export const addCourseSlice = createSlice({
    name: 'addCourse',
    initialState,
    reducers: {
        // Generic updater: merge payload into state
        setCourseDetailsData: (state, action: PayloadAction<Partial<CourseDetailsDataType>>) => {
            state.courseDetailsData = {
                ...state.courseDetailsData,
                ...action.payload,
            };
        },
        setIsLessonAdded: (state, action: PayloadAction<boolean>) => {
            state.isLessonAdded = action.payload
        },
        resetAddCourseData: () => {
            return initialState
        }
    },
})

// Export actions
export const {
    setCourseDetailsData,
    setIsLessonAdded,
    resetAddCourseData,
} = addCourseSlice.actions

// Export reducer
export default addCourseSlice.reducer

// Selectors
export const dataSelector = (state: RootState) => state.addCourse

export const addCourseDataSelector = createSelector(
    dataSelector,
    state => state
)

export const isLessonAddedSelector = createSelector(
    dataSelector,
    state => state.isLessonAdded
)
