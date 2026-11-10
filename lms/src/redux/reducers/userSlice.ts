// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { UserDetails } from '@/utils/api/user/getUserDetails'

// Initial state with some default data
const initialState = {
    data: {},
    isLogin: false,
    userName: '',
    token: '',
    lastFetch: null
}

// Create a Redux slice
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserDetails>) => {
            state.data = action.payload
            if (action.payload) {
                state.isLogin = true
            }
        },
        logoutSuccess: () => {
            return initialState;
        },
        setUserName: (state, action: PayloadAction<string>) => {
            state.userName = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setUserLastFetch: (state, action) => {
            state.lastFetch = action.payload
        },
    }
})

export const { setUserData, logoutSuccess, setUserName, setToken, setUserLastFetch } = userSlice.actions

export default userSlice.reducer

export const dataSelector = (state: RootState) => state?.user

export const userDataSelector = createSelector(dataSelector, state => state.data)
export const isLoginSelector = createSelector(dataSelector, state => state.isLogin)
export const userNameSelector = createSelector(dataSelector, state => state.userName)
export const tokenSelector = createSelector(dataSelector, state => state.token)
export const userLastFetchSelector = createSelector(dataSelector, state => state.lastFetch)