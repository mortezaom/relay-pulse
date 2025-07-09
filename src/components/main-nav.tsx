"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";

export function MainNav(props: { className?: string }) {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const darkStorage = localStorage.getItem("dark-mode");
		if (!darkStorage) {
			setDarkMode(true);
		} else if (`${darkStorage}` === "true") {
			setDarkMode(true);
		} else {
			setDarkMode(false);
		}
	}, []);

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark");
			localStorage.setItem("dark-mode", "true");
		} else {
			document.body.classList.remove("dark");
			localStorage.setItem("dark-mode", "false");
		}
	}, [darkMode]);

	return (
		<nav className={cn("flex items-center justify-between", props.className)}>
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
					onClick={() => setDarkMode(!darkMode)}
				>
					{darkMode ? (
						<SunIcon className="size-5" />
					) : (
						<MoonIcon className="size-5" />
					)}
				</button>
			</div>
		</nav>
	);
}
