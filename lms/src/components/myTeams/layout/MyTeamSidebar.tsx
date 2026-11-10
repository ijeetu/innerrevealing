// src/components/instructor/InstructorSidebar.tsx
"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LuBook,
  // LuClipboardEdit, // Previous icon
  LuStar,
  LuFileText,
  LuBell,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { LucideClipboardEdit } from "lucide-react"; // Keep this if it was intentionally different
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { teamMemberDataSelector } from "@/redux/instructorReducers/teamMemberSlice";
import { TeamMemberDataType } from "@/utils/api/instructor/team-member/getTeamMembers";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { invitorsSelector } from "@/redux/reducers/invitorsSlice";


const InstructorSidebar = () => {

  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const settings = useSelector(settingsSelector);
  const logo = settings?.data?.horizontal_logo;
  const teamMemberData = useSelector(teamMemberDataSelector) as TeamMemberDataType[]

  // invitors-instructors data
  const invitorsInstructorsData = useSelector(invitorsSelector);
  const invitorData = invitorsInstructorsData.map((item) => item.instructor);

  const pathname = usePathname();
  const { slug } = useParams();
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const currentInvitorData = invitorData?.find((member) => member?.slug === slug);

  // Toggle dropdown state
  const toggleDropdown = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const navItems = [
    {
      icon: LuBook,
      label: t("course"),
      href: `/my-teams/${slug}/course`,
      type: "link",
    },
    {
      icon: LucideClipboardEdit,
      label: t("assignments"),
      href: `/my-teams/${slug}/assignments`,
      type: "link",
    },
    {
      icon: LuStar,
      label: t("reviews"),
      href: `/my-teams/${slug}/reviews`,
      type: "link",
    },
    {
      icon: LuFileText,
      label: t("student_quiz_reports"),
      href: `/my-teams/${slug}/student-quiz-reports`,
      type: "link",
    },
    {
      icon: LuBell,
      label: t("notifications"),
      href: `/my-teams/${slug}/notifications`,
      type: "link",
    },
  ];


  return (
    <Sidebar className="w-64 flex-shrink-0 border-r dark:border-sidebar-border text-white">
      {/* logo section */}
      <div className="flex items-center justify-center p-4 bg-[#010211]">
        <Link href={`/my-teams/${slug}/course`} onClick={handleLinkClick}>
          <div className="w-[112px] max-h-[48px] sm:w-[200px] sm:max-h-[64px] md:max-h-[80px] h-auto">
            <CustomImageTag
              src={logo}
              alt={'logo'}
              className="w-full h-full"
            />
          </div>
        </Link>
      </div>

      {/* User Profile Section - Can be part of SidebarHeader or a SidebarGroup */}
      <div className="flex flex-col items-center space-y-2 pb-2 px-4 !bg-[#010211] text-white">
        <div className="w-full opacity-40 mb-4 bg-[#d9d9d9] h-[1px]" />
        <Avatar className="h-12 w-12">
          {currentInvitorData?.profile ? (
            <CustomImageTag
              src={currentInvitorData?.profile}
              alt={currentInvitorData?.name}
              className="h-12 w-12"
            />
          ) : (
            <AvatarFallback className="bg-[#FFFFFF3D]">
              {currentInvitorData?.name?.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-lg font-semibold text-white dark:text-sidebar-foreground">
          {currentInvitorData?.name}
        </h2>
        <p className="text-sm mt-[-8px] text-gray-400 dark:text-sidebar-accent-foreground">
          {t("team")}
        </p>

        <Link
          href="/instructor/dashboard"
          onClick={handleLinkClick}
          className="border border-gray-400 rounded-md p-2 flex items-center justify-center w-full mt-2"
        >
          <p
            className="text-sm
           text-white"
          >
            {t("back_to_instructor")}
          </p>
        </Link>
        <div className="w-full h-[1px] bg-gray-800 mt-4" />
      </div>

      <SidebarContent className="flex-1 overflow-y-auto p-4 !pt-0 space-y-5 !bg-[#010211] text-white customScrollbar">
        {/* My Teams Section */}
        <SidebarGroup className="p-0">
          <h3 className="px-0 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 dark:text-sidebar-accent-foreground/70">
            {t("my_teams")}
          </h3>
          {teamMemberData.map((member) => (
            <div key={member.user.name}>
              <Link
                href={`/my-teams/${member.user.slug}/course`}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-3 py-2 my-1 rounded-lg text-gray-400 hover:bg-[#FFFFFF3D] hover:text-white cursor-pointer group dark:hover:bg-sidebar-accent dark:text-sidebar-accent-foreground ${member.user.slug === slug ? "bg-[#FFFFFF3D]" : ""}`}
              >
                <CustomImageTag src={member.user.profile} alt={member.user.name} className="h-8 w-8" />
                <div>
                  <p className="text-sm font-semibold text-white dark:text-sidebar-foreground group-hover:dark:text-sidebar-foreground">
                    {member.user.name}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </SidebarGroup>
        {/* Navigation Group */}
        <SidebarGroup className="p-0">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                {item.type === "link" ? (
                  <Link
                    href={item.href || "#"}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 px-3 py-2 my-1 rounded-lg transition-colors ${pathname === item.href
                      ? "bg-white"
                      : "text-gray-400 hover:bg-[#FFFFFF3D] hover:text-white"
                      }`}
                  >
                    <item.icon
                      className={`${pathname === item.href ? "text-black" : "text-white"
                        } h-5 w-5`}
                    />
                    <span
                      className={`font-light ${pathname === item.href ? "text-black" : "text-white"
                        }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2 my-1 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors ${pathname.includes(
                        `/instructor/${item.label.toLowerCase()}`
                      )
                        ? "text-white"
                        : ""
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 text-white" />
                        <span className="font-light text-white">
                          {item.label}
                        </span>
                      </div>
                      {expandedItems[item.label] ? (
                        <LuChevronUp className="h-4 w-4 text-white" />
                      ) : (
                        <LuChevronDown className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Optional: SidebarFooter can be added here if needed */}
      {/* <SidebarFooter>Footer content</SidebarFooter> */}
    </Sidebar>
  );
};

export default InstructorSidebar;
