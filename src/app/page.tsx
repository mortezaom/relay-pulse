import { AlertCircleIcon } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { LinePulseCard, PinnedPulseCard } from "@/components/pulse-card";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function Home() {
	return (
		<main className="w-full max-w-[64rem] px-4 mx-auto">
			<div className="flex flex-col items-stretch">
				<MainNav className="flex justify-between items-center px-4 border-b h-16" />
				<div className="flex-1 space-y-4 pt-6">
					<Alert className="p-4">
						<AlertCircleIcon />
						<AlertTitle className="font-bold text-sm">
							All Services Operational!
						</AlertTitle>
					</Alert>
					<div className="gap-4 grid sm:grid-cols-1 md:grid-cols-2">
						<PinnedPulseCard
							title="Server #1"
							link="https://mortezaom.dev"
							icon={
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="size-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							}
						/>
						<PinnedPulseCard
							title="Bilit Website"
							link="https://bilit.events"
							icon={
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									className="size-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-4 mt-8 mb-4">
					<h3>All Services:</h3>
					<LinePulseCard
						title="Stats Server"
						link="https://status.mortezaom.dev"
					/>

					<LinePulseCard
						title="Stats Server"
						link="https://status.mortezaom.dev"
					/>
				</div>
			</div>
		</main>
	);
}
