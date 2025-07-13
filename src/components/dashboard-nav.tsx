import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";
import { ThemeSwitcher } from "./theme-switcher";

export const DashboardNav = (props: { className?: string }) => {
	return (
		<nav
			className={cn(
				"flex items-center justify-between",
				props.className,
			)}
		>
			<div className="flex items-center space-x-4 lg:space-x-6">
				<a
					href="/"
					className="flex justify-center items-center size-12"
				>
					<LogoVector className="size-6" />
				</a>

				<a
					href="/dashboard"
					className="font-medium hover:text-primary text-sm transition-colors"
				>
					Dashboard
				</a>
			</div>

			<div className="flex justify-end items-center">
				<ThemeSwitcher />
			</div>
		</nav>
	);
};
