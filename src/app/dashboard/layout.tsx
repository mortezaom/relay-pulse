"use client";

import type { ReactNode } from "react";
import {
  DashboardMobileHeader,
  DashboardMobileNav,
  DashboardSidebar,
} from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <DashboardMobileHeader />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 pb-20 md:p-6 md:pb-8 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <DashboardMobileNav />
      </div>
    </div>
  );
}
