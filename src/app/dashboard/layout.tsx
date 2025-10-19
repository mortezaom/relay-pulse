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
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Mobile Header */}
				<DashboardMobileHeader />

				{/* Scrollable Content Area */}
				<main className="flex-1 overflow-y-auto">
					<div className="mx-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl">
						{children}
					</div>
				</main>

				{/* Mobile Bottom Navigation */}
				<DashboardMobileNav />
			</div>
		</div>
	);
}
