import { Notification } from "@/utils/api/user/notification/getNotification";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface NotificationState {
    data: Notification[]
    limit: number
    page: number
    totalNotifications: number
    loadMore: boolean
    isInvitationStatusUpdated: boolean
    next_page_url: string | null
    allTotalNotifications: number
}

// Initail State
const initialState: NotificationState = {
    data: [],
    limit: 4,
    page: 1,
    totalNotifications: 0,
    allTotalNotifications: 0,
    loadMore: false,
    isInvitationStatusUpdated: false,
    next_page_url: null,
}

// Create a Redux Slice
export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotificationData: (state, action: PayloadAction<Notification[]>) => {
            state.data = action.payload
        },
        setNotificationLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload
        },
        setNotificationPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload
        },
        setTotalNotifications: (state, action: PayloadAction<number>) => {
            state.totalNotifications = action.payload
        },
        setAllTotalNotifications: (state, action: PayloadAction<number>) => {
            state.allTotalNotifications = action.payload
        },
        setNotificationLoadMore: (state, action: PayloadAction<boolean>) => {
            state.loadMore = action.payload
        },
        resetNotificationState: (state) => {
            state.page = 1;
        },
        isInvitationStatusUpdated: (state, action: PayloadAction<boolean>) => {
            state.isInvitationStatusUpdated = action.payload
        },
        setNextPageUrl: (state, action: PayloadAction<string | null>) => {
            state.next_page_url = action.payload
        }
    }
})

// Export the actions
export const { setNotificationData, setNotificationLimit, setNotificationPage, setTotalNotifications, setNotificationLoadMore, resetNotificationState, isInvitationStatusUpdated, setAllTotalNotifications, setNextPageUrl } = notificationSlice.actions

// Export the reducer
export default notificationSlice.reducer

export const dataSelector = (state: RootState) => state.notification
export const notificationDataSelector = createSelector(dataSelector, state => state.data)
export const notificationLimitSelector = createSelector(dataSelector, state => state.limit)
export const notificationPageSelector = createSelector(dataSelector, state => state.page)
export const totalNotificationsSelector = createSelector(dataSelector, state => state.totalNotifications)
export const allTotalNotificationsSelector = createSelector(dataSelector, state => state.allTotalNotifications)
export const notificationLoadMoreSelector = createSelector(dataSelector, state => state.loadMore)
export const isInvitationStatusUpdatedSelector = createSelector(dataSelector, state => state.isInvitationStatusUpdated)
export const nextPageUrlSelector = createSelector(dataSelector, state => state.next_page_url)
