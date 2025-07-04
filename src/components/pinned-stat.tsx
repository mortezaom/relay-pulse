import type { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { StatsContent } from "./stats-content";

export const PinnedStat = ({
	title,
	link,
	icon,
}: {
	title: string;
	link: string;
	icon: Component;
}) => {
	return (
		<Card class="flex flex-col justify-between items-stretch">
			<CardHeader class="flex flex-col items-start space-y-0 p-4 w-full">
				<div class="flex justify-between items-center mb-0.5 w-full">
					<CardTitle class="font-medium text-sm">{title}</CardTitle>
					<Dynamic component={icon} />
				</div>
				<CardDescription>
					<a class="font-bold text-xs underline" href={link}>
						{link}
					</a>
				</CardDescription>
			</CardHeader>
			<StatsContent />
		</Card>
	);
};
