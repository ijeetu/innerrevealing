"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface CourseTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CourseTabs: React.FC<CourseTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex flex-nowrap space-x-4 sm:space-x-8 border-b border-gray-200 pt-4 px-4 overflow-x-auto scroll-smooth">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`whitespace-nowrap pb-3 px-1 text-sm sm:text-base transition-all relative shrink-0 ${
            activeTab === tab.id
              ? "text-indigo-600 font-bold border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700 font-medium border-b-2 border-transparent"
          }`}
          onClick={(e) => {
            onTabChange(tab.id);
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}
        >
          {tab.label}
        </button>
      ))}
      <div className="w-12 shrink-0 sm:hidden"></div>
    </div>
  );
};

export default CourseTabs;
