// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { UserDetails } from '@/utils/api/user/getUserDetails'
import { removeAuthToken } from '@/utils/cookies'

// Initial state with some default data
const initialState = {
    data: {},
    isLogin: false,
    isMobileLogin: false,
    userName: '',
    token: '',
    firebaseToken: '',
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
            removeAuthToken();
            return initialState;
        },
        isMobileLogin: (state, action: PayloadAction<boolean>) => {
            state.isMobileLogin = action.payload
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
        setFirebaseToken: (state, action: PayloadAction<string>) => {
            state.firebaseToken = action.payload;
        },
    }
})

export const { setUserData, logoutSuccess, isMobileLogin, setUserName, setToken, setUserLastFetch, setFirebaseToken } = userSlice.actions

export default userSlice.reducer

export const dataSelector = (state: RootState) => state?.user

export const userDataSelector = createSelector(dataSelector, state => state.data)
export const isLoginSelector = createSelector(dataSelector, state => state.isLogin)
export const userNameSelector = createSelector(dataSelector, state => state.userName)
export const tokenSelector = createSelector(dataSelector, state => state.token)
export const userLastFetchSelector = createSelector(dataSelector, state => state.lastFetch)
export const firebaseTokenSelector = createSelector(dataSelector, state => state.firebaseToken)