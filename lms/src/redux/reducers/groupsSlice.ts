"use client";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { GroupItem } from "@/utils/api/user/helpdesk/groups/groups";

type GroupsState = {
    data: GroupItem[];
  };

const initialState: GroupsState = {
    data: [],
}

export const  groupsSlice = createSlice({
    name : "groups",
    initialState,
    reducers: {
        setGroupsData: (state,action:PayloadAction<GroupItem[]>) => {
            state.data = action.payload;
        }
    }
});

export const { setGroupsData} = groupsSlice.actions;
export default groupsSlice.reducer;

export const dataSelector = (state: RootState) => state.groups;

export const groupsSelector = createSelector(dataSelector, groups => groups.data);