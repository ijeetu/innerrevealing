"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import check from "@/assets/images/instructor/check.png";
import { BiChevronRight } from "react-icons/bi";
import { useTranslation } from "@/hooks/useTranslation";
export default function TeamRequestSuccessPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 text-center">
      {/* Green checkmark icon in a circular badge */}
      <div className="flex items-center justify-center mb-4 md:mb-6">
        <Image
          src={check}
          alt="check"
          width={100}
          height={100}
          className="w-[70px] h-[70px] md:w-[100px] md:h-[100px]"
        />
      </div>

      {/* Welcome message */}
      <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
        {t("welcome_to_the_team")}
      </h1>

      {/* Success message */}
      <p className="max-w-xs md:max-w-md text-xs md:text-sm text-muted-foreground mb-5 md:mb-6">
        {t("you_have_successfully_joined_as_a_co_instructor_you_can_start_collaborating_on_the_course_by_visiting_the_course_dashboard")}
      </p>

      {/* Dashboard button */}
      <Link href="/instructor/dashboard">
        <Button
          variant="default"
          className="bg-black text-white hover:bg-gray-800 text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5"
        >
          {t("go_to_dashboard")}{" "}
          <span className="ml-1 md:ml-2">
            <BiChevronRight className="text-lg md:text-xl" />
          </span>
        </Button>
      </Link>
    </div>
  );
}
