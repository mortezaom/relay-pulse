"use client";

import { Bell, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";
import { ThemeSwitcher } from "./theme-switcher";

const navigationItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
		description: "Overview & services",
	},
	{
		title: "Notifications",
		href: "/dashboard/notifications",
		icon: Bell,
		description: "Manage notification channels",
	},
	// Future: Add more routes
	// {
	//   title: "Settings",
	//   href: "/dashboard/settings",
	//   icon: Settings,
	//   description: "Global settings",
	// },
];

export function DashboardSidebar() {
	const pathname = usePathname();

	return (
		<aside className="hidden md:flex flex-col bg-background/50 backdrop-blur-sm border-r w-64">
			{/* Logo / Header */}
			<div className="flex items-center gap-3 px-6 border-b h-16">
				<Link href="/" className="flex justify-center items-center size-10">
					<LogoVector className="size-6" />
				</Link>
				<div className="flex flex-col">
					<span className="font-semibold text-lg">Relay Pulse</span>
					<span className="text-muted-foreground text-xs">Monitoring</span>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-2 p-4">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
								"hover:bg-accent hover:text-accent-foreground",
								isActive &&
									"bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
							)}
						>
							<Icon className="flex-shrink-0 size-5" />
							<div className="flex flex-col flex-1 min-w-0">
								<span className="font-medium text-sm">{item.title}</span>
								{!isActive && (
									<span className="text-muted-foreground text-xs truncate">
										{item.description}
									</span>
								)}
							</div>
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-4 border-t">
				<ThemeSwitcher />
			</div>
		</aside>
	);
}

export function DashboardMobileHeader() {
	const pathname = usePathname();
	const currentItem = navigationItems.find((item) => item.href === pathname);

	return (
		<header className="md:hidden top-0 z-50 sticky flex justify-between items-center bg-background/95 backdrop-blur-sm px-4 border-b h-16">
			<div className="flex items-center gap-3">
				<Link href="/" className="flex justify-center items-center size-10">
					<LogoVector className="size-5" />
				</Link>
				<div className="flex flex-col">
					<span className="font-semibold text-sm">
						{currentItem?.title || "Dashboard"}
					</span>
					<span className="text-muted-foreground text-xs">
						{currentItem?.description || "Relay Pulse"}
					</span>
				</div>
			</div>
			<ThemeSwitcher />
		</header>
	);
}

export function DashboardMobileNav() {
	const pathname = usePathname();

	return (
		<nav className="md:hidden right-0 bottom-0 left-0 z-50 fixed bg-background/95 backdrop-blur-sm border-t h-16">
			<div className="flex justify-around items-center px-2 h-full">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-col flex-1 justify-center items-center gap-1 h-full",
								"transition-colors duration-200",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="size-5" />
							<span className="font-medium text-xs">{item.title}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
