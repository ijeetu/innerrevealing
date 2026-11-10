"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { logoutSuccess as clearCoupons } from "@/redux/reducers/couponSlice";
import { resetTeamMemberData } from "@/redux/instructorReducers/teamMemberSlice";
import { clearBillingDetails } from "@/redux/reducers/billingDeatilsSlice";
import { setCartData } from "@/redux/reducers/cartSlice";
import { logoutLocalSession } from "@/utils/localAuth";

export default function LogoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    logoutLocalSession().then(() => {
      dispatch(logoutSuccess());
      dispatch(clearCoupons());
      dispatch(resetTeamMemberData());
      dispatch(clearBillingDetails());
      dispatch(setCartData(null));
      router.replace("/");
    }).catch((failure) => setError(failure instanceof Error ? failure.message : "Could not sign out. Please try again."));
  }, [dispatch, router]);
  return <main className="container py-16 space-y-4"><p role={error ? "alert" : "status"}>{error || "Signing out…"}</p>{error && <button className="ir-lms-register" onClick={() => window.location.reload()}>Try again</button>}</main>;
}
