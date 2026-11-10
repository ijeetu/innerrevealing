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
    const name = process.env.NEXT_PUBLIC_WEB_NAME?.trim() || 'Inner Revealing';
    const logo = process.env.NEXT_PUBLIC_WEB_LOGO?.trim();

    return {
        ...state,
        data: {
            ...state.data,
            system_color: '#5700b8',
            system_light_colour: '#f3ebfa',
            hover_color: '#450092',
            announcement_bar: '',
            instructor_mode: 'single' as WebSettings['instructor_mode'],
            app_name: name,
            web_name: name,
            favicon: '/inner-revealing-logo.png',
            ...(logo ? { horizontal_logo: logo, vertical_logo: logo } : {}),
            contact_address: 'Satish Mukherjee Road, Kalighat, Kolkata, West Bengal 700026, India',
            contact_email: 'innerrevealing@gmail.com',
            contact_phone: '+919836147999',
            footer_description: 'Meditation Centre, Psychological Counselling and Healing Centre in Kolkata.',
            website_copyright: `<p>Copyright &copy; ${new Date().getFullYear()} <a href="https://www.innerrevealing.com">Inner Revealing Meditation Centre</a>. All rights reserved.</p>`,
            social_media: [
                { id: 1, name: 'Facebook', icon: '', url: 'https://www.facebook.com/infinitelovemed' },
                { id: 2, name: 'Instagram', icon: '', url: 'https://www.instagram.com/infinitelovemeditation' },
                { id: 3, name: 'YouTube', icon: '', url: 'https://www.youtube.com/@innerrevealing' },
            ],
            playstore_url: null,
            appstore_url: null,
            android_app_link: '',
            ios_app_link: '',
        },
    };
})
export const settingsLastFetchSelector = createSelector(dataSelector, state => state.lastFetch)
