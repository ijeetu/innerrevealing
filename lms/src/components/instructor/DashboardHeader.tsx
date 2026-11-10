"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger
import LanguageModal from "../modals/LanguageModal";
import NotificationDropdown from "@/components/dropdowns/NotificationDropdown";
import { useSelector } from "react-redux";
import { isLoginSelector, userDataSelector } from "@/redux/reducers/userSlice";
import { User } from "./courses/types";
import ProfileDropdown from "../dropdowns/ProfileDropdown";

const DashboardHeader = () => {
  const userData = useSelector(userDataSelector) as User;
  const isLogin = useSelector(isLoginSelector);
  return (
    <header className="bg-white shadow-sm p-3 sm:p-6 flex items-center justify-between flex-wrap gap-y-4 sm:gap-0">
      {/* Left side: Hamburger (SidebarTrigger) and Title */}
      <div className="flex items-center">
        <SidebarTrigger className="bg-[#F8F8F9] w-10 h-10 rounded-[4px] border borderColor">
          {" "}
          {/* Use SidebarTrigger here, it renders a button with a LuMenu icon by default */}
          {/* You can customize the icon if needed, but default should be fine */}
          {/* <LuMenu className="h-6 w-6" /> */}
        </SidebarTrigger>
      </div>

      {/* Right side: Icons and User Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notification Bell with Badge */}
        {/* <Button variant="ghost" size="icon" className="relative"> */}
        {isLogin && (
          <NotificationDropdown />
        )}
        {/* </Button> */}

        {/* Language Selector - Basic Placeholder */}
        <LanguageModal />

        <div className="border borderColor h-12 max-[385px]:ml-1 ml-3"></div>

        {/* User Profile Dropdown */}
        {
          userData &&
          <ProfileDropdown isInstructor={true} />
        }
      </div>
    </header>
  );
};

export default DashboardHeader;
