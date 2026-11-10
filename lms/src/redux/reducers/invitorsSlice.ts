"use client";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";// adjust path
import { Invitor } from "@/utils/api/instructor/team-member/getInvitor";

type InvitorsState = {
    data: Invitor[];
};

const initialState: InvitorsState = {
    data: [],
};

export const invitorsSlice = createSlice({
    name: "invitors",
    initialState,
    reducers: {
        setInvitorsData: (state, action: PayloadAction<Invitor[]>) => {
            state.data = action.payload;
        },
    },
});

export const { setInvitorsData } = invitorsSlice.actions;
export default invitorsSlice.reducer;
export const dataSelector = (state: RootState) => state.invitors;
export const invitorsSelector = createSelector(dataSelector, (invitors) => invitors.data);
