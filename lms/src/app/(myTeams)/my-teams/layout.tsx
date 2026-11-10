"use client";

import React from "react";
import MyTeamSidebar from "@/components/myTeams/layout/MyTeamSidebar";
import DashboardHeader from "@/components/instructor/DashboardHeader";
import DashboardFooter from "@/components/instructor/DashboardFooter";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MyTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen">
        {/* Sidebar */}
        <MyTeamSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <DashboardHeader />

          {/* Page Content */}
          <main className="flex-1 sectionBg px-4 md:px-6 py-4">{children}</main>

          {/* Footer */}
          <DashboardFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
