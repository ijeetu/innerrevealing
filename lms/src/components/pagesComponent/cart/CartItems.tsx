"use client";
import { FiBookmark, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getCartData,
  removeCourseFromCart,
  setCartData,
  updateCartItemWishlistStatus,
} from "@/redux/reducers/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { removeFromCart } from "@/utils/api/user/get-cart/removeFromCart";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { FaBookmark, FaStar, FaTag } from "react-icons/fa";
import DataNotFound from "@/components/commonComp/DataNotFound";
import { getAppliedCoupons, removeCoupon } from "@/redux/reducers/couponSlice";
import Link from "next/link";
import { isCartPromoAppliedSelector, setIsCartPromoApplied } from "@/redux/reducers/helpersReducer";
import { getCurrencySymbol } from "@/utils/helpers";
import { getCartItems } from "@/utils/api/user/get-cart/getCart";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";

export default function CartItems() {
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { toggleWishlist } = useWishlist();

  const cartData = useSelector(getCartData);
  const appliedCoupons = useSelector(getAppliedCoupons);
  const isCartPromoApplied = useSelector(isCartPromoAppliedSelector);

  const [isRemovingItem, setIsRemovingItem] = useState<number | null>(null);
  const [wishlistLoadingItems, setWishlistLoadingItems] = useState<Set<number>>(
    new Set()
  );

  const handleRemoveItem = async (id: number) => {
    try {
      setIsRemovingItem(id);
      const response = await removeFromCart(id);
      if (response && !response.error) {
        toast.success(response.message || t("item_removed_from_cart"));

        // Remove coupon from Redux state for this course
        dispatch(removeCoupon(id));

        // Fetch updated cart data from backend
        const updatedCart = await getCartItems();
        if (updatedCart && !updatedCart.error) {
          // Update Redux with fresh, accurate data from backend
          dispatch(setCartData(updatedCart.data));
        } else {
          // Fallback to optimistic update if fetch fails
          dispatch(removeCourseFromCart(id));
        }
        if (updatedCart?.data.courses.length === 0) {
          dispatch(setIsCartPromoApplied(false));
        }
      } else {
        toast.error(response?.message || t("failed_to_remove_item"));
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error(t("unexpected_error_removing_item"));
    } finally {
      setIsRemovingItem(null);
    }
  };

  const handleToggleWishlist = async (id: number, isWishlisted: boolean) => {
    setWishlistLoadingItems((prev) => new Set(prev).add(id));

    try {
      const success = await toggleWishlist(id, isWishlisted);
      if (success) {
        dispatch(
          updateCartItemWishlistStatus({
            courseId: id,
            isWishlisted: !isWishlisted,
          })
        );
        setWishlistLoadingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error(t("unexpected_error_toggling_wishlist"));
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header indicating the number of items */}
      <h2 className="text-xl font-semibold mb-4">
        {t("cart_items_count").replace(
          "{count}",
          cartData?.courses.length?.toString() || "0"
        )}
      </h2>

      {/* Show empty cart state when no items */}
      {(!cartData?.courses || cartData.courses.length === 0) ? (
        <DataNotFound />
      ) : (
        /* Map over the cart items and render each one */
        cartData.courses.map((item) => {
          // Find if there's an applied coupon for this course from API data
          const couponCode = cartData?.promo_discounts?.find(
            (promo) => promo.course_id === item.id
          )?.promo_code;

          return (
            <div
              key={item.id}
              className="flex flex-row gap-4 border border-gray-200 rounded-2xl p-4 relative"
            >


              {/* Course Image Placeholder */}
              <Link href={`/course-details/${item.slug}`} className="h-[80px] w-[80px] md:h-[120px] md:w-[120px] bg-gray-200 rounded-2xl">
                <CustomImageTag src={item.thumbnail} alt={item.title} className="object-cover h-[80px] w-[80px] md:h-[120px] md:w-[120px] rounded-2xl" />
              </Link>

              {/* Course Details & Actions Combined Flex Container */}
              {/* We use flex-grow to take remaining space and flex-col to stack details and actions */}
              <div className="flex flex-col flex-grow">
                {/* Top section for details */}
                <Link href={`/course-details/${item.slug}`} className="flex-grow space-y-1">

                  <div className="flex ">
                    {/* Optional Coupon Tag - Shows coupon code if applied to this course */}
                    {couponCode && (
                      <div className="absolute top-2 right-2 sm:right-4 tertiaryColor text-xs px-2.5 py-0.5 rounded hidden items-center gap-1 z-10 lg:flex">
                        <FaTag size={12} />
                        {t("coupon_applied")}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold">{item.title}</h3>

                  <p className="text-sm">
                    {t("by_label")}{" "}
                    <span className="font-semibold primaryColor underline cursor-pointer">
                      {item.instructor}
                    </span>
                  </p>
                  {/* Optional Coupon Tag - Shows coupon code if applied to this course */}
                  {couponCode && (
                    <div className="tertiaryColor text-xs rounded flex items-center gap-1 lg:hidden">
                      <FaTag size={12} />
                      {t("coupon_applied")}
                    </div>
                  )}
                  {/* Cart Course Discount and Original Price */}
                  <div>
                    {item.course_discount && item.course_discount > 0 ? (
                      <div className="flex items-center gap-2 pt-1 font-semibold flex-wrap">
                        <span className="text-lg">{getCurrencySymbol()}{item.subtotal?.toFixed(2)}</span>
                        <span className="text-sm text-gray-400 line-through font-normal">{getCurrencySymbol()}{item.original_price?.toFixed(2)}</span>
                        {/* <span className="text-sm text-red-500 font-medium">
                          {(((item.original_price - item.subtotal) / item.original_price) * 100).toFixed(2)}% {t("off")}
                        </span> */}
                      </div>
                    ) : (
                      <span className="text-lg font-semibold">{getCurrencySymbol()}{item.original_price?.toFixed(2)}</span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-col items-start gap-1 pt-2 mt-2 sm:flex-row sm:items-center sm:mt-auto sm:gap-4 text-sm text-gray-600">
                  <button
                    className="flex items-center gap-1 hover:primaryColor transition-colors cursor-pointer"
                    disabled={wishlistLoadingItems.has(item.id)}
                    onClick={() =>
                      handleToggleWishlist(item.id, item.is_wishlisted)
                    }
                  >
                    {wishlistLoadingItems.has(item.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : item.is_wishlisted ? (
                      <FaBookmark size={16} />
                    ) : (
                      <FiBookmark size={16} />
                    )}
                    {item.is_wishlisted ? (
                      t("remove_from_wishlist")
                    ) : (
                      t("move_to_wishlist")
                    )}
                  </button>
                  <div className="h-full w-[1px] bg-gray-200"></div>
                  <button
                    className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer"
                    disabled={isRemovingItem === item.id}
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    {isRemovingItem === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                    {t("remove_item")}
                  </button>
                </div>
              </div>
            </div >
          );
        })
      )}
    </div >
  );
}
