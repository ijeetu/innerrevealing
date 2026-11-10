import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { BillingDetailsUser } from "@/components/instructor/courses/types";

// Define the state interface
interface BillingState {
    billingDetails: BillingDetailsUser | null;
}

// Initial state
const initialState: BillingState = {
    billingDetails: null,
};

// Create the billing slice
export const billingSlice = createSlice({
    name: "billing",
    initialState,
    reducers: {
        // Set billing details
        setBillingDetails: (state, action: PayloadAction<BillingDetailsUser | null>) => {
            state.billingDetails = action.payload;
        },
        // Clear billing details (e.g., on logout)
        clearBillingDetails: (state) => {
            state.billingDetails = null;
        },
    },
});

// Export actions
export const { setBillingDetails, clearBillingDetails } = billingSlice.actions;

// Export reducer
export default billingSlice.reducer;

// Selectors
export const dataSelector = (state: RootState) => state.billingDetails;

export const getBillingDetails = createSelector(dataSelector, (state) => state.billingDetails);