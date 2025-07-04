import { type Component, createSignal, For, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { CardContent } from "./ui/card";

export type LineData = {
	value: number;
	message?: string;
};

type LineStatsContentProps = {
	arrayOfLines?: LineData[];
	uptime: string;
};

export const LineStatsContent: Component<LineStatsContentProps> = (props) => {
	const arrayOfLines =
		props.arrayOfLines ||
		Array.from({ length: 50 }).map((_, i) => ({
			value: 100,
			message: `Line ${i + 1}`,
		}));

	const [message, setMessage] = createSignal<string | undefined>();
	let closeTimeout: number | undefined;

	const handleMouseEnter = (msg?: string) => {
		if (closeTimeout) {
			clearTimeout(closeTimeout);
			closeTimeout = undefined;
		}
		setMessage(msg);
	};

	const handleMouseLeave = () => {
		closeTimeout = window.setTimeout(() => {
			setMessage(undefined);
			closeTimeout = undefined;
		}, 150);
	};

	return (
		<CardContent class="relative p-4 pt-2">
			<div class="flex sm:flex-row flex-col items-stretch gap-0.5 h-16 sm:h-8">
				<ul class="flex items-stretch gap-0.5 w-full h-8">
					<For each={arrayOfLines.slice(0, 25)}>
						{(item) => (
							<li
								onMouseEnter={() => handleMouseEnter(item.message)}
								onMouseLeave={handleMouseLeave}
								class="bg-blue-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
							/>
						)}
					</For>
				</ul>
				<ul class="flex items-stretch gap-0.5 w-full h-8">
					<For each={arrayOfLines.slice(25)}>
						{(item) => (
							<li
								onMouseEnter={() => handleMouseEnter(item.message)}
								onMouseLeave={handleMouseLeave}
								class="bg-blue-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
							/>
						)}
					</For>
				</ul>
			</div>
			<div class="flex justify-between items-center mt-2 min-h-[1.5em] font-bold text-muted-foreground text-xs">
				<Presence exitBeforeEnter>
					<Show when={message()} keyed>
						{(msg) => (
							<Motion.div
								initial={{ opacity: 0, y: 3 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -3 }}
								transition={{ duration: 0.15 }}
								class="flex justify-between items-center w-full text-blue-500"
							>
								<span>{msg}</span>
							</Motion.div>
						)}
					</Show>
					<Show when={!message()} keyed>
						<Motion.div
							initial={{ opacity: 0, y: 3 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -3 }}
							transition={{ duration: 0.15 }}
							class="flex justify-between items-center w-full"
						>
							<span></span>
							<span>Uptime {props.uptime}%</span>
						</Motion.div>
					</Show>
				</Presence>
			</div>
		</CardContent>
	);
};
