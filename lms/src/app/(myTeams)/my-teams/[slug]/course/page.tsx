"use client";
import TeamAllCourses from "@/components/myTeams/Courses/TeamAllCourses";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <TeamAllCourses teamSlug={slug}/>
    </>
  );
}

