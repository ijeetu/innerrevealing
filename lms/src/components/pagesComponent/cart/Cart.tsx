// src/components/pagesComponent/cart/Cart.tsx માં આ ફેરફાર કરો

"use client";

import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/commonComp/Breadcrumb";
import CartItems from "./CartItems";
import BillingDetails from "./BillingDetails";
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from 'react-redux';
import { getCartData } from '@/redux/reducers/cartSlice';
import withBalanceCheck from "@/components/hoc/withBalanceCheck";

function Cart() {
  const { t } = useTranslation();
  const cartData = useSelector(getCartData);

  // Check if cart has items
  const hasCartItems = cartData?.courses && cartData.courses.length > 0;

  return (
    <Layout>
      <Breadcrumb title={t("course_cart")} firstElement={t("course_cart")} />

      <div className="container pt-14 pb-0 mb-12">
        <div className="grid grid-cols-12 gap-6">
          <div className={hasCartItems ? "col-span-12 md:col-span-7 lg:col-span-8" : "col-span-12"}>
            <CartItems />
          </div>

          {hasCartItems && (
            <div className="col-span-12 md:col-span-5 lg:col-span-4 md:mt-[40px] lg:mt-0">
              <BillingDetails />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withBalanceCheck(Cart, true);
