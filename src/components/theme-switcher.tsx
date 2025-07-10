"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export const ThemeSwitcher = (props: { className?: string }) => {
	const { setTheme, theme } = useTheme();

	return (
		<button
			className={cn(
				"cursor-pointer rounded-md p-2 transition-colors hover:bg-accent",
				props.className,
			)}
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
		>
			{theme === "light" ? (
				<MoonIcon className="size-5" />
			) : (
				<SunIcon className="size-5" />
			)}
		</button>
	);
};
