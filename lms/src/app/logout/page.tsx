"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutSuccess } from "@/redux/reducers/userSlice";
import { logoutSuccess as logoutSuccessCoupon } from "@/redux/reducers/couponSlice";

export default function LogoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(logoutSuccess());
    dispatch(logoutSuccessCoupon());
    router.replace("/");
  }, [dispatch, router]);

  return null;
}
