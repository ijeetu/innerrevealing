import { CourseLanguage } from "@/utils/api/general/getCourseLanguages";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
    data: [] as CourseLanguage[],
    lastFetch: null as number | null
}

export const courseLanguageSlice = createSlice({
    name: 'courseLanguage',
    initialState,
    reducers: {
        setCourseLanguageData: (state, action: PayloadAction<CourseLanguage[]>) => {
            state.data = action.payload
        },
        setCourseLanguageLastFetch: (state, action: PayloadAction<number>) => {
            state.lastFetch = action.payload
        }
    }
});

export const { setCourseLanguageData, setCourseLanguageLastFetch } = courseLanguageSlice.actions;
export default courseLanguageSlice.reducer;

export const dataSelector = (state: RootState) => state.courseLanguage;
export const lastFetchSelector = createSelector(dataSelector, state => state.lastFetch)
export const courseLanguageDataSelector = createSelector(dataSelector, state => state.data)