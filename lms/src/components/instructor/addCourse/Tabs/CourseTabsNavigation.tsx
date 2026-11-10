"use client";
import CustomImageTag from "@/components/commonComp/customImage/CustomImageTag";
import React from "react";

// Interface for tab data
export interface CourseTab {
  id: string;
  icon: string;
  label: string;
  description: string;
}

// Props interface for the component
interface CourseTabsNavigationProps {
  tabs: CourseTab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleTabsRestriction: (targetTab: string) => boolean;
}

// This component handles the navigation tabs for the course creation flow
const CourseTabsNavigation = ({ tabs, activeTab, setActiveTab, handleTabsRestriction }: CourseTabsNavigationProps) => {

  const handleTabClick = (tab: string) => {
    // First check if it's the same tab (no need to validate)
    if (tab === activeTab) {
      return;
    }

    // Call the restriction function to validate access to the target tab
    const canAccess = handleTabsRestriction(tab);

    // Only change tab if validation passes
    if (canAccess) {
      setActiveTab(tab);
    }
  }

  return (
    <div className="flex flex-col w-full h-auto p-1 md:p-0.5 lg:p-2 bg-white gap-0 rounded-[10px] overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          value={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`w-full h-auto mt-1 md:mt-0.5 lg:mt-2 first:mt-0 text-left p-0 rounded-md ${activeTab === tab.id ? "bg-[var(--primary-color)] text-white" : ""}`}
        >
          <div className="p-2 md:p-1.5 lg:p-4 flex items-center gap-2 md:gap-1.5 lg:gap-4 w-full">
            <div className={`w-12 h-12 rounded-full flexCenter ${activeTab === tab.id ? "bg-white" : "bg-[#01021114]"}`}>
              <span className="text-xs md:text-[10px] lg:text-sm font-medium">
                <CustomImageTag src={tab.icon} alt="icon" className="w-7 h-7 object-contain" />
              </span>
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-sm md:text-xs lg:text-base truncate">
                {tab.label}
              </h3>
              <p className="text-[10px] md:text-[8px] lg:text-xs opacity-80 w-full line-clamp-2 md:line-clamp-1">
                {tab.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CourseTabsNavigation;
