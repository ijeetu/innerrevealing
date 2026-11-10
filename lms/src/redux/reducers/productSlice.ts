'use client';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: null,
  productsToShow: 9,
  filterView: false,
};

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setProductsToShow: (state, action) => {
      state.productsToShow = action.payload;
    },
    setFilterView: (state, action) => {
      state.filterView = action.payload;
    },
  },
});

export const { setSelectedCategory, setProductsToShow, setFilterView } = productSlice.actions;
export default productSlice.reducer;
