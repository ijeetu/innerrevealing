'use client'
import InstructorLayout from "@/components/instructor/Layout/Layout";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
