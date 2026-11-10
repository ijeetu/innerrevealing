// Import necessary modules
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { CategoryDataType, SubCategoriesDataType } from '@/types'

// Define the state interface for better type safety
interface CategoryState {
    data: CategoryDataType[] | null
    limit: number
    page: number
    totalCates: number
    loadMoreCates: boolean
    selectedCategory: {
        category: CategoryDataType | null,
        subCategory: SubCategoriesDataType | null,
        nestedCategory: SubCategoriesDataType | null,
    }
}

// Initial state with proper typing
const initialState: CategoryState = {
    data: null,
    limit: 16,
    page: 1,
    totalCates: 0,
    loadMoreCates: false,
    selectedCategory: {
        category: null as CategoryDataType | null,
        subCategory: null as SubCategoriesDataType | null,
        nestedCategory: null as SubCategoriesDataType | null,
    },
}

// Create a Redux slice
export const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        setCategoryData: (state, action: PayloadAction<CategoryDataType[]>) => {
            state.data = action.payload
        },
        clearCategoryData: (state) => {
            state.data = null
        },
        updateCategoryOffset: (state, action) => {
            state.page = action.payload
        },
        loadMorecategories: (state, action) => {
            state.loadMoreCates = action.payload
        },
        updateTotalCates: (state, action) => {
            state.totalCates = action.payload.data
        },
        setSelectedCategory: (state, action: PayloadAction<{
            category: CategoryDataType | null,
            subCategory: SubCategoriesDataType | null,
            nestedCategory: SubCategoriesDataType | null,
        }>) => {
            const { category, subCategory, nestedCategory } = action.payload
            if (category) {
                state.selectedCategory.category = category ? category : null
            }
            if (subCategory) {
                state.selectedCategory.subCategory = subCategory ? subCategory : null
            }
            if (nestedCategory) {
                state.selectedCategory.nestedCategory = nestedCategory ? nestedCategory : null
            }
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = {
                category: null,
                subCategory: null,
                nestedCategory: null,
            }
        },
    }
})

export const { setCategoryData, clearCategoryData, updateCategoryOffset, loadMorecategories, updateTotalCates, setSelectedCategory, clearSelectedCategory } = categorySlice.actions

export default categorySlice.reducer

export const dataSelector = (state: RootState) => state.category

export const categoryDataSelector = createSelector(dataSelector, state => state.data)

export const totalCates = createSelector(dataSelector, state => state.totalCates)

export const categoryLimit = createSelector(dataSelector, state => state.limit)

export const categoryPage = createSelector(dataSelector, state => state.page)
export const IsLoadMoreCates = createSelector(dataSelector, state => state.loadMoreCates)
export const selectedCategorySelector = createSelector(dataSelector, state => state.selectedCategory)
