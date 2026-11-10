// Import necessary modules
import { createSelector, createSlice,PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { TeamMemberDataType } from '@/utils/api/instructor/team-member/getTeamMembers'

// Define the state interface for better type safety
interface TeamMemberState {
    teamMemberData: TeamMemberDataType[]
    isNewMemberAdded: boolean
    limit: number
    page: number
    totalTeamMembers: number
    loadMoreTeamMembers: boolean
}

// Initial state with some default data
const initialState: TeamMemberState = {
    teamMemberData: [] as TeamMemberDataType[],
    isNewMemberAdded: false,
    limit: 10,
    page: 1,
    totalTeamMembers: 0,
    loadMoreTeamMembers: false,
}

// Create a Redux slice
export const teamMemberSlice = createSlice({
    name: 'teamMember',
    initialState,
    reducers: {
        setTeamMemberData: (state, action:PayloadAction<TeamMemberDataType[]>) => {
            state.teamMemberData = action.payload
        },  
        setIsNewMemberAdded: (state, action:PayloadAction<boolean>) => {
            state.isNewMemberAdded = action.payload
        },
        updateTeamMemberOffset: (state, action) => {
            state.page = action.payload
        },
        loadMoreTeamMembers: (state, action) => {
            state.loadMoreTeamMembers = action.payload
        },
        updateTotalTeamMembers: (state, action) => {
            state.totalTeamMembers = action.payload.data
        },
        resetTeamMemberData: () => {
            return initialState
        }
    }
})

export const { setTeamMemberData, setIsNewMemberAdded, updateTeamMemberOffset, loadMoreTeamMembers, updateTotalTeamMembers, resetTeamMemberData } = teamMemberSlice.actions

export default teamMemberSlice.reducer

export const dataSelector = (state: RootState) => state.teamMember

export const teamMemberDataSelector = createSelector(dataSelector, state => state.teamMemberData)
export const isNewMemberAddedSelector = createSelector(dataSelector, state => state.isNewMemberAdded)
export const teamMemberLimit = createSelector(dataSelector, state => state.limit)
export const teamMemberPage = createSelector(dataSelector, state => state.page)
export const totalTeamMembers = createSelector(dataSelector, state => state.totalTeamMembers)
export const IsLoadMoreTeamMembers = createSelector(dataSelector, state => state.loadMoreTeamMembers)