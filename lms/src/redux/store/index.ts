"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import productReducer from "../reducers/productSlice";
import settingsReducer from "../reducers/settingsSlice";
import userReducer from "../reducers/userSlice";
import categoryReducer from "../reducers/categorySlice";
import cartReducer from "../reducers/cartSlice";
import teamMemberReducer from "../instructorReducers/teamMemberSlice";
import helpersReducer from "../reducers/helpersReducer";
import addCourseReducer from "../instructorReducers/AddCourseSlice";
import becomeInstructorReducer from "../instructorReducers/becomeInstructor";
import curriculamReducer from "../instructorReducers/createCourseReducers/curriculamSlice";
import languageReducer from "../reducers/languageSlice";
import groupsReducer from "../reducers/groupsSlice";
import couponReducer from "../reducers/couponSlice";
import notificationReducer from "../reducers/nottificationSlice";
import courseLanguageReducer from "../reducers/courseLanguageSlice";
import billingDetailsReducer from "../reducers/billingDeatilsSlice";
import invitorsReducer from "../reducers/invitorsSlice";
const persistConfig = {
  key: "e-lms",
  storage,
};

// example
const rootReducer = combineReducers({
  product: productReducer,
  settings: settingsReducer,
  user: userReducer,
  category: categoryReducer,
  cart: cartReducer,
  language: languageReducer,
  teamMember: teamMemberReducer,
  helpers: helpersReducer,
  becomeInstructor: becomeInstructorReducer,
  addCourse: addCourseReducer,
  curriculam: curriculamReducer,
  groups: groupsReducer,
  coupon: couponReducer,
  notification: notificationReducer,
  courseLanguage: courseLanguageReducer,
  billingDetails: billingDetailsReducer,
  invitors: invitorsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
