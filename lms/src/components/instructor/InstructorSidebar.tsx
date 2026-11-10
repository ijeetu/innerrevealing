"use client";
import React, { useEffect, useState } from "react";
import { currentLanguageSelector, isRTLSelector } from "@/redux/reducers/languageSlice";
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
  LuLayoutDashboard,
  LuBook,
  LuUsers,
  LuStar,
  LuFileText,
  LuTicket,
  LuDollarSign,
  LuBell,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { LucideClipboardEdit } from "lucide-react"; // Keep this if it was intentionally different
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { userDataSelector } from "@/redux/reducers/userSlice";
import CustomImageTag from "../commonComp/customImage/CustomImageTag";
import { useTranslation } from "@/hooks/useTranslation";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { UserDetails } from "@/utils/api/user/getUserDetails";
import { invitorsSelector } from "@/redux/reducers/invitorsSlice";
import { PiCircleBold } from "react-icons/pi";

const InstructorSidebar = () => {

  const { t } = useTranslation();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const settings = useSelector(settingsSelector);
  const logo = settings?.data?.horizontal_logo;
  const currentLangCode = useSelector(currentLanguageSelector);
  const isRTL = useSelector(isRTLSelector);
  const userData = useSelector(userDataSelector) as UserDetails
  const side = isRTL ? "right" : "left";

  // invitors-instructors data
  const invitorsInstructorsData = useSelector(invitorsSelector);
  const invitorData = invitorsInstructorsData.map((item) => item.instructor);

  const [isClient, setIsClient] = useState<boolean>(false);

  const instructorType = userData?.instructor_details?.type;

  const isTeam = instructorType === "team";

  const displayName = isTeam
    ? userData?.instructor_details?.personal_details?.team_name
    : userData?.name;

  const displayAvatar = isTeam
    ? userData?.instructor_details?.personal_details?.team_logo
    : userData?.profile;
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

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
      icon: LuLayoutDashboard,
      label: t("dashboard"),
      href: "/instructor/dashboard",
      type: "link",
    },
    {
      icon: LuBook,
      label: t("my_course"),
      href: "/instructor/my-course",
      otherHref: {
        href1: "/instructor/courses",
        href2: "/instructor/my-course",
      },
      type: "link",
    },
    // Only show team member menu item if user is a team instructor
    ...(userData?.instructor_details?.type === 'team' ? [{
      icon: LuUsers,
      label: t("team_member"),
      href: "/instructor/team-member",
      type: "link",
    }] : []),
    {
      icon: LucideClipboardEdit,
      label: t("assignments"),
      href: "/instructor/assignments",
      type: "link",
    },
    {
      icon: LuStar,
      label: t("reviews"),
      href: "/instructor/reviews",
      type: "link",
    },
    {
      icon: LuFileText,
      label: t("student_quiz_reports"),
      href: "/instructor/student-quiz-reports",
      type: "link",
    },
    {
      icon: LuTicket,
      label: t("coupon"),
      subItems: [
        {
          label: t("all_coupons"),
          href: "/instructor/coupon",
          type: "link",
        },
        {
          label: t("add_new_coupon"),
          href: "/instructor/coupon/add-new",
          type: "link",
        },
      ],
    },
    {
      icon: LuDollarSign,
      label: t("earnings"),
      subItems: [
        {
          label: t("overview"),
          href: "/instructor/earnings",
          type: "link",
        },
        {
          label: t("refund_requests"),
          href: "/instructor/refund-requests",
          type: "link",
        },
      ],
    },
    {
      icon: LuBell,
      label: t("notifications"),
      href: "/instructor/notifications",
      type: "link",
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
        isClient &&
        <Sidebar side={side} className="w-64 flex-shrink-0 border-r dark:border-sidebar-border text-white">
      {/* logo section */}
      <div className="flex items-center justify-center p-4 bg-[#010211]">
        <Link href={"/instructor/dashboard"} onClick={handleLinkClick}>
          <div className="w-[112px] max-h-[48px] sm:w-[200px] sm:max-h-[64px] md:max-h-[80px] h-auto" >
            <CustomImageTag
              src={logo}
              alt={'logo'}
              className="w-full h-[60px] object-contain"
            />
          </div>
        </Link>
      </div>

      {/* User Profile Section - Can be part of SidebarHeader or a SidebarGroup */}
      <div className="flex flex-col items-center space-y-2 pb-2 px-4 !bg-[#010211] text-white">
        <div className="w-full opacity-40 mb-4 bg-[#d9d9d9] h-[1px]" />

        <Avatar className="h-12 w-12">
          {displayAvatar ? (
            <CustomImageTag
              src={displayAvatar}
              alt={displayName || ""}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <AvatarFallback className="dark:bg-sidebar-accent dark:text-sidebar-accent-foreground">
              {displayName?.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <h2 className="text-lg font-semibold text-white dark:text-sidebar-foreground text-center">
          {displayName}
        </h2>

        <p className="text-sm mt-[-8px] text-gray-400 dark:text-sidebar-accent-foreground">
          {isTeam ? t("team_instructor") : t("instructor")}
        </p>

        <div className="w-full bg-[#d9d9d9] h-[1px] opacity-40 mt-4" />
      </div>


      <SidebarContent className="flex-1 overflow-y-auto p-4 !pt-0 space-y-5 !bg-[#010211] text-white customScrollbar instructorSidebar">
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
                      ? "bg-white text-black"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    <item.icon
                      className={`h-5 w-5`}
                    />
                    <span
                      className={`font-light`}
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

                    {expandedItems[item.label] && item.subItems && (
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={handleLinkClick}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${pathname === subItem.href
                              ? "bg-gray-700 text-black"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                              }`}
                          >
                            <PiCircleBold className="h-[10px] w-[10px] shrink-0 text-white" />
                            <span
                              className={
                                pathname === subItem.href
                                  ? "text-white"
                                  : "text-white"
                              }
                            >
                              {subItem.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* My Teams Section */}
        <SidebarGroup className="p-0">
          {
            invitorData.length > 0 &&
            <h3 className="px-0 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 dark:text-sidebar-accent-foreground/70">
              {t("teams_i’ve_joined")}
            </h3>
          }
          {invitorData.map((member) => (
            <div key={member?.id}>
              <Link
                href={`/my-teams/${member?.slug}/course`}
                onClick={handleLinkClick}
                className="flex items-center space-x-3 px-3 py-2 my-1 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white cursor-pointer group dark:hover:bg-sidebar-accent dark:text-sidebar-accent-foreground"
              >
                <CustomImageTag src={member?.profile} alt={member?.name} className="h-8 w-8 rounded-full" />
                <div>
                  <p className="text-sm font-semibold text-white dark:text-sidebar-foreground group-hover:dark:text-sidebar-foreground">
                    {member?.name}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default InstructorSidebar;
