// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { BecomeInstructorDataType } from '@/types/instructorTypes/instructorTypes'

// Initial state with some default data
const initialState: BecomeInstructorDataType = {
  instructorType: '',
  qualification: '',
  experience: '',
  skills: '',
  bankName: '',
  bankAccNum: '', 
  bankHolderName: '',
  bankIfscCode: '',
  idProof: null,
  previewVideo: null,
  teamName: '',
  teamLogo: null,
  aboutMe: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },
  customFields: [],
  customFieldsData: {}, // Add custom fields data object
  agreementAccepted: false,
}

// Create a Redux slice
export const becomeInstructorSlice = createSlice({
  name: 'becomeInstructor',
  initialState,
  reducers: {
    // Generic updater: merge payload into state
    setBecomeInstructorData: (state, action: PayloadAction<Partial<BecomeInstructorDataType>>) => {
      return { ...state, ...action.payload }
    },
    // Special case: update a social media field
    setSocialMedia: (
      state,
      action: PayloadAction<{ key: keyof BecomeInstructorDataType['socialMedia']; value: string }>
    ) => {
      state.socialMedia[action.payload.key] = action.payload.value
    },
    // Special case: update custom field data
    setCustomFieldData: (
      state,
      action: PayloadAction<{ fieldId: number; value: string | File | null }>
    ) => {
      const { fieldId, value } = action.payload;
      // Ensure customFieldsData is initialized as an object
      if (!state.customFieldsData) {
        state.customFieldsData = {};
      }
      state.customFieldsData[fieldId] = value;
    },
    // Special case: update multiple custom fields data
    setCustomFieldsData: (
      state,
      action: PayloadAction<Record<string, string | File | null>>
    ) => {
      // Ensure customFieldsData is initialized as an object
      if (!state.customFieldsData) {
        state.customFieldsData = {};
      }
      state.customFieldsData = { ...state.customFieldsData, ...action.payload };
    },
    resetBecomeInstructorData: () => {
      return initialState;
    },
  },
})

// Export actions
export const {
  setBecomeInstructorData,
  setSocialMedia,
  setCustomFieldData,
  setCustomFieldsData,
  resetBecomeInstructorData,
} = becomeInstructorSlice.actions

// Export reducer
export default becomeInstructorSlice.reducer

// Selectors
export const dataSelector = (state: RootState) => state.becomeInstructor
export const becomeInstructorDataSelector = createSelector(
  dataSelector,
  state => state
)
