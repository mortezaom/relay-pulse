import type { Component } from "solid-js";
import { cn } from "~/lib/utils";
import { LogoVector } from "./icons";

export const LogoType: Component<{ class?: string }> = (props) => {
	return (
		<div
			class={cn(
				"z-20 relative flex items-end font-medium text-lg",
				props.class,
			)}
		>
			<LogoVector class="size-6" />
			<strong class="z-[21] -mb-[6px] ml-1 text-[1.2rem] leading-3 hide-first">
				Relay Pulse
			</strong>
		</div>
	);
};
