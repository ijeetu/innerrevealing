"use client";

import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "@/components/layout/Layout";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { isLoginSelector } from "@/redux/reducers/userSlice";
import { setIsLoginModalOpen } from "@/redux/reducers/helpersReducer";

export default function AccountPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const isLogin = useSelector(isLoginSelector);
  const dispatch = useDispatch();
  return <Layout>
    <section className="sectionBg border-b borderColor py-10 md:py-14">
      <div className="container space-y-3">
        <p className="primaryColor text-xs font-semibold uppercase tracking-[0.16em]">Your account</p>
        <h1 className="text-3xl md:text-4xl font-semibold secondaryColor">{title}</h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
      </div>
    </section>
    <div className="container py-8 md:py-12">
      {isLogin ? <div className="flex flex-col lg:flex-row gap-6 items-start">
        <ProfileSidebar />
        <div className="bg-white border borderColor rounded-2xl p-6 md:p-8 flex-1 w-full">{children}</div>
      </div> : <div className="bg-white border borderColor rounded-2xl p-8 space-y-4">
        <p>Sign in to manage your account.</p>
        <button className="ir-lms-register" onClick={() => dispatch(setIsLoginModalOpen(true))}>Sign in</button>
      </div>}
    </div>
  </Layout>;
}
