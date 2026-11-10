// Import necessary modules
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { CartData } from "@/utils/api/user/get-cart/getCart";

// Define the cart state interface
interface CartState {
  cartData: CartData | null;
}

// Initial state
const initialState: CartState = {
  cartData: null,
};

// Create the cart slice
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Set cart data
    setCartData: (state, action: PayloadAction<CartData | null>) => {
      state.cartData = action.payload;
    },
    // Update cart with full cart response from API
    updateCartFromResponse: (state, action: PayloadAction<CartData>) => {
      state.cartData = action.payload;
    },
    // Optimistically remove course from cart
    removeCourseFromCart: (state, action: PayloadAction<number>) => {
      if (state.cartData && state.cartData.courses) {
        // Find the course to remove
        const courseToRemove = state.cartData.courses.find(
          (course) => course.id === action.payload
        );

        if (courseToRemove) {
          // Remove the course from the courses array
          state.cartData.courses = state.cartData.courses.filter(
            (course) => course.id !== action.payload
          );

          // Remove the promo discount from the courses array
          state.cartData.promo_discounts = state.cartData.promo_discounts.filter(
            (promoDiscount) => promoDiscount.course_id !== action.payload
          );

          // If no courses left, set cart data to null
          if (state.cartData.courses.length === 0) {
            state.cartData = null;
            return;
          }

          // Use the price that was actually added to the cart
          // If there's a discount price (greater than 0), use it; otherwise use the regular price
          const priceToSubtract = courseToRemove.display_discount_price > 0
            ? courseToRemove.display_discount_price
            : courseToRemove.display_price;

          state.cartData.subtotal_price -= priceToSubtract;
          state.cartData.total_price =
            state.cartData.subtotal_price - (state.cartData.discount_price ?? 0);
        }
      }
    },
    updateCartItemWishlistStatus: (
      state,
      action: PayloadAction<{ courseId: number; isWishlisted: boolean }>
    ) => {
      if (state.cartData && state.cartData.courses) {
        state.cartData.courses = state.cartData.courses.map((course) =>
          course.id === action.payload.courseId
            ? { ...course, is_wishlisted: action.payload.isWishlisted }
            : course
        );
      }
    },
  },
});

// Export actions
export const {
  setCartData,
  updateCartFromResponse,
  removeCourseFromCart,
  updateCartItemWishlistStatus,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;

// Selectors
export const cartStateSelector = (state: RootState) => state.cart;

export const getCartData = createSelector(
  cartStateSelector,
  (state) => state.cartData
);
