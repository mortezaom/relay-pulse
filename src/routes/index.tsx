import { MainNav } from "~/components/main-nav";
import { PinnedStat } from "~/components/pinned-stat";
import { StatItem } from "~/components/stat-item";
import { Callout, CalloutTitle } from "~/components/ui/callout";

export default () => {
	return (
		<main class="container">
			<div class="flex flex-col items-stretch">
				<MainNav class="flex justify-between items-center px-4 border-b h-16" />
				<div class="flex-1 space-y-4 pt-6">
					<Callout variant="success" class="p-4">
						<CalloutTitle class="font-bold text-sm">
							All Services Operational!
						</CalloutTitle>
					</Callout>
					<div class="gap-4 grid sm:grid-cols-1 md:grid-cols-2">
						<PinnedStat
							title="Server #1"
							link="https://mortezaom.dev"
							icon={() => (
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							)}
						/>
						<PinnedStat
							title="Bilit Website"
							link="https://bilit.events"
							icon={() => (
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							)}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-4 mt-8 mb-4">
					<h3>All Services:</h3>
					<StatItem
						title="Stats Server"
						link="https://status.mortezaom.dev"
					/>

					<StatItem
						title="Stats Server"
						link="https://status.mortezaom.dev"
					/>
				</div>
			</div>
		</main>
	);
};
