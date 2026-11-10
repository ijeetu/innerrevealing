// Import necessary modules
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseCoupon } from "@/utils/api/user/getCourseCoupons";
import { CalculationSummaryCoupon } from "@/utils/api/user/applyCoupon";

// Define the applied coupon interface
export interface AppliedCoupon {
  courseId: number;
  coupon: CourseCoupon;
  summary?: CalculationSummaryCoupon;
  appliedAt: string;
}

// Define the coupon state interface
interface CouponState {
  appliedCoupons: AppliedCoupon[];
  // Track if any instructor coupon is applied (to prevent admin coupons)
  hasInstructorCoupon: boolean;
}

// Initial state
const initialState: CouponState = {
  appliedCoupons: [],
  hasInstructorCoupon: false,
};

// Create the coupon slice
export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    // Apply a coupon to a specific course
    applyCoupon: (state, action: PayloadAction<{ courseId: number; coupon: CourseCoupon, summary?: CalculationSummaryCoupon }>) => {
      const { courseId, coupon, summary } = action.payload;

      // Remove any existing coupon for this course first
      state.appliedCoupons = state.appliedCoupons.filter(
        (applied) => applied.courseId !== courseId
      );

      // Add the new coupon
      const newAppliedCoupon: AppliedCoupon = {
        courseId,
        coupon,
        summary,
        appliedAt: new Date().toISOString(),
      };

      state.appliedCoupons.push(newAppliedCoupon);

      // Update instructor coupon flag
      // Check if any applied coupon is from an instructor
      state.hasInstructorCoupon = state.appliedCoupons.some(
        (applied) => applied.coupon.created_by === "instructor"
      );
    },

    // Remove a coupon from a specific course
    removeCoupon: (state, action: PayloadAction<number>) => {
      const courseId = action.payload;

      // Remove the coupon for this course
      state.appliedCoupons = state.appliedCoupons.filter(
        (applied) => applied.courseId !== courseId
      );

      // Update instructor coupon flag
      state.hasInstructorCoupon = state.appliedCoupons.some(
        (applied) => applied.coupon.created_by === "instructor"
      );
    },

    // Clear all applied coupons
    clearAllCoupons: (state) => {
      state.appliedCoupons = [];
      state.hasInstructorCoupon = false;
    },

    // Get applied coupon for a specific course
    getAppliedCouponForCourse: (state) => {
      // This is handled by selectors, but we can keep it for consistency
      return state;
    },

    // logout
    logoutSuccess: () => {
      return {
        appliedCoupons: [],
        hasInstructorCoupon: false,
      };
    },
  },
});

// Export actions
export const {
  logoutSuccess,
  applyCoupon,
  removeCoupon,
  clearAllCoupons,
} = couponSlice.actions;

// Export reducer
export default couponSlice.reducer;

// Selectors
export const getAppliedCoupons = (state: { coupon: CouponState }) => state.coupon.appliedCoupons;
export const getHasInstructorCoupon = (state: { coupon: CouponState }) => state.coupon.hasInstructorCoupon;

// Selector to get applied coupon for a specific course
export const getAppliedCouponForCourse = (state: { coupon: CouponState }, courseId: number) => {
  return state.coupon.appliedCoupons.find(
    (applied) => applied.courseId === courseId
  );
};

// Selector to check if a course has an applied coupon
export const hasAppliedCoupon = (state: { coupon: CouponState }, courseId: number) => {
  return state.coupon.appliedCoupons.some(
    (applied) => applied.courseId === courseId
  );
};
