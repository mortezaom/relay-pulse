import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";
import { ThemeSwitcher } from "./theme-switcher";

export const DashboardNav = (props: { className?: string }) => (
  <nav className={cn("flex items-center justify-between", props.className)}>
    <div className="flex items-center space-x-4 lg:space-x-6">
      <a className="flex size-12 items-center justify-center" href="/">
        <LogoVector className="size-6" />
      </a>

      <a
        className="font-medium text-sm transition-colors hover:text-primary"
        href="/dashboard"
      >
        Dashboard
      </a>
    </div>

    <div className="flex items-center justify-end">
      <ThemeSwitcher />
    </div>
  </nav>
);
