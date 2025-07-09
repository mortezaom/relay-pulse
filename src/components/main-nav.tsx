"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";

export function MainNav(props: { className?: string }) {
	const { setTheme, theme } = useTheme();

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
					className="flex justify-center items-center ml-[-1.1rem] size-12"
				>
					<LogoVector className="size-8" />
				</a>

				<a
					href="/examples/dashboard"
					className="font-medium hover:text-primary text-sm transition-colors"
				>
					Overview
				</a>
			</div>

			<div className="flex justify-end items-center gap-2">
				<button
					className="cursor-pointer"
					type="button"
					onClick={() =>
						setTheme(theme === "dark" ? "light" : "dark")
					}
				>
					{theme === "light" ? (
						<MoonIcon className="size-5" />
					) : (
						<SunIcon className="size-5" />
					)}
				</button>
			</div>
		</nav>
	);
}
