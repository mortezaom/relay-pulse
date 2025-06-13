import type { ComponentProps } from "solid-js";
import {
	createEffect,
	createSignal,
	onMount,
	Show,
	splitProps,
} from "solid-js";

import { cn } from "~/lib/utils";
import { IconMoon, IconSun } from "./icons";

export function MainNav(props: ComponentProps<"nav">) {
	const [, rest] = splitProps(props, ["class"]);

	const [darkMode, setDarkMode] = createSignal(false);

	onMount(() => {
		const darkStorage = localStorage.getItem("dark-mode");
		if (!darkStorage) {
			setDarkMode(true);
		} else if (`${darkStorage}` === "true") {
			setDarkMode(true);
		} else {
			setDarkMode(false);
		}
	});

	createEffect(() => {
		if (darkMode()) {
			document.body.classList.add("dark");
			localStorage.setItem("dark-mode", "true");
		} else {
			document.body.classList.remove("dark");
			localStorage.setItem("dark-mode", "false");
		}
	});

	return (
		<nav class={cn("flex items-center justify-between", props.class)} {...rest}>
			<div class="flex items-center space-x-4 lg:space-x-6">
				<a href="/" class="ml-[-1.1rem] size-12">
					<img
						src="/img/logo.webp"
						class="cursor-pointer size-12"
						classList={{ "dark-image": darkMode() }}
						alt=""
					/>
				</a>

				<a
					href="/examples/dashboard"
					class="text-sm font-medium transition-colors hover:text-primary"
				>
					Overview
				</a>
			</div>

			{/* <UserNav /> */}
			<div class="flex items-center justify-end gap-2">
				<button type="button" onClick={() => setDarkMode(!darkMode())}>
					<Show when={darkMode()}>
						<IconMoon size={20} />
					</Show>
					<Show when={!darkMode()}>
						<IconSun size={20} />
					</Show>
				</button>
			</div>
		</nav>
	);
}
