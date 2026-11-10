'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { LanguageItem } from '@/utils/api/language/getLanguages';

// Simple language state interface
interface LanguageState {
    languages: LanguageItem[];
    currentLanguage: string | null;
    currentTranslations: { [key: string]: string };
    isRTL: boolean;
    lastFetch: number | null;
    currentLanguageCode: string | null;
}

const getInitialState = (): LanguageState => {
    if (typeof window !== 'undefined') {
        const serverLang = (window as typeof window & { __INITIAL_LANG__?: { code: string; isRTL: boolean; translations: Record<string, string>; languages: LanguageItem[] } }).__INITIAL_LANG__;
        if (serverLang) {
            return {
                languages: serverLang.languages ?? [],
                currentLanguage: serverLang.code,
                currentLanguageCode: serverLang.code,
                currentTranslations: serverLang.translations ?? {},
                isRTL: serverLang.isRTL,
                lastFetch: Date.now(),
            };
        }
    }
    return {
        languages: [],
        currentLanguage: null,
        currentTranslations: {},
        isRTL: false,
        lastFetch: null,
        currentLanguageCode: null,
    };
};

const initialState: LanguageState = getInitialState();

// Simple language slice - no async thunks, just basic reducers
export const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        // Set all languages data
        setLanguages: (state, action: PayloadAction<LanguageItem[]>) => {
            state.languages = action.payload;
        },
        
        // Set current language
        setCurrentLanguage: (state, action: PayloadAction<string>) => {
            state.currentLanguage = action.payload;
        },
        
        // Set current translations
        setCurrentTranslations: (state, action: PayloadAction<{ [key: string]: string }>) => {
            state.currentTranslations = action.payload;
        },
        
        // Set RTL state
        setIsRTL: (state, action: PayloadAction<boolean>) => {
            state.isRTL = action.payload;
        },
        
        // Set last fetch timestamp
        setLanguageLastFetch: (state, action: PayloadAction<number>) => {
            state.lastFetch = action.payload;
        },
        setCurrentLanguageCode: (state, action: PayloadAction<string>) => {
            state.currentLanguageCode = action.payload;
        },
        
        // Reset language state
        resetLanguageState: () => {
            return initialState;
        },
    },
});

// Export actions
export const { 
    setLanguages, 
    setCurrentLanguage, 
    setCurrentTranslations, 
    setIsRTL, 
    setLanguageLastFetch, 
    resetLanguageState ,
    setCurrentLanguageCode
} = languageSlice.actions;

// Export reducer
export default languageSlice.reducer;

// Simple selectors following settingsSlice pattern
export const languageDataSelector = (state: RootState) => state.language;

export const languagesSelector = createSelector(languageDataSelector, state => state.languages);
export const currentLanguageSelector = createSelector(languageDataSelector, state => state.currentLanguageCode);
export const currentTranslationsSelector = createSelector(languageDataSelector, state => state.currentTranslations);
export const isRTLSelector = createSelector(languageDataSelector, state => state.isRTL);
export const languageLastFetchSelector = createSelector(languageDataSelector, state => state.lastFetch);
