"use client";

import { Bell, Cpu, LayoutDashboard } from "lucide-react";
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
    title: "Services",
    href: "/dashboard/services",
    icon: Cpu,
    description: "Manage services",
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
    <aside className="hidden w-64 flex-col border-r bg-background/50 backdrop-blur-sm md:flex">
      {/* Logo / Header */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <Link className="flex size-10 items-center justify-center" href="/">
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive &&
                  "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-5 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium text-sm">{item.title}</span>
                {!isActive && (
                  <span className="truncate text-muted-foreground text-xs">
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <ThemeSwitcher />
      </div>
    </aside>
  );
}

export function DashboardMobileHeader() {
  const pathname = usePathname();
  const currentItem = navigationItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
      <div className="flex items-center gap-3">
        <Link className="flex size-10 items-center justify-center" href="/">
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
    <nav className="fixed right-0 bottom-0 left-0 z-50 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-1",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
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
