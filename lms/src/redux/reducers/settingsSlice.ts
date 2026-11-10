'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { WebSettings } from '@/utils/api/general/getSettings';

const initialState = {
    data: {} as WebSettings,
    fcmtoken: "",
    lastFetch: null
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action:PayloadAction<WebSettings>) => {
            state.data = action.payload
        },
        setFcmTokenData: (state, action: PayloadAction<string>) => {
            state.fcmtoken = action.payload
        },
        setSettingsLastFetch: (state, action) => {
            state.lastFetch = action.payload
        },
    },
});

export const { setFcmTokenData, setSettings, setSettingsLastFetch } = settingsSlice.actions;
export default settingsSlice.reducer;

export const dataSelector = (state: RootState) => state.settings

// Explicit deployment branding takes priority over API and persisted settings.
export const settingsSelector = createSelector(dataSelector, state => {
    const name = process.env.NEXT_PUBLIC_WEB_NAME?.trim();
    const logo = process.env.NEXT_PUBLIC_WEB_LOGO?.trim();

    return {
        ...state,
        data: {
            ...state.data,
            ...(name ? { app_name: name, web_name: name } : {}),
            ...(logo ? { horizontal_logo: logo, vertical_logo: logo } : {}),
        },
    };
})
export const settingsLastFetchSelector = createSelector(dataSelector, state => state.lastFetch)
