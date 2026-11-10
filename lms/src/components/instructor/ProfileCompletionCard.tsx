'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import CircularProgress from "@/components/ui/circular-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { LuPencil } from "react-icons/lu";
import { ProfileCompletion } from "@/utils/api/instructor/dashboad/getInstructorDashboard";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileCompletionCardProps {
  profileCompletion: ProfileCompletion;
}

const ProfileCompletionCard = ({ profileCompletion }: ProfileCompletionCardProps) => {

  const { t } = useTranslation();
  return (
    <>
      <Card className="bg-white rounded-2xl border-none">
        <CardContent className="p-6 flex items-start sm:items-center gap-6 flex-wrap">
          {/* Progress Circle */}
          <CircularProgress
            value={profileCompletion?.percentage}
            progressColor="#83B807"
            size={120}
            textClassName="text-black text-xl"
          />

          {/* Text Content and Button */}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
              {t("completeProfileInstructorTitle")}
            </CardTitle>
            <CardDescription className="w-full max-w-[1380px] opacity-[0.76] font-['Geist'] font-normal text-[16px] leading-[24px] tracking-[0%] mb-4 text-gray-900">
              {t("completeProfileInstructorDescription")}
            </CardDescription>
            <Link href="/edit-profile">
              <Button
                variant="default"
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                <LuPencil className="h-4 w-4" />
                {t("edit_profile")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileCompletionCard;
