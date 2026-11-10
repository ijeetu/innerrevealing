'use client'
import React, { createContext, useContext, useState } from "react";

export type TabValue = "course-details" | "pricing" | "curriculum" | "publish";

interface CourseTabContextType {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  goToPreviousTab: () => void;
}

const CourseTabContext = createContext<CourseTabContextType | undefined>(
  undefined
);

export function CourseTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabValue>("course-details");

  const goToPreviousTab = () => {
    switch (activeTab) {
      case "publish":
        setActiveTab("curriculum");
        break;
      case "curriculum":
        setActiveTab("pricing");
        break;
      case "pricing":
        setActiveTab("course-details");
        break;
      default:
        break;
    }
  };

  return (
    <CourseTabContext.Provider
      value={{ activeTab, setActiveTab, goToPreviousTab }}
    >
      {children}
    </CourseTabContext.Provider>
  );
}

export function useCourseTab() {
  const context = useContext(CourseTabContext);
  if (context === undefined) {
    throw new Error("useCourseTab must be used within a CourseTabProvider");
  }
  return context;
}
