import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AlertCircleIcon } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { LinePulseCard, PinnedPulseCard } from "@/components/pulse-card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { getBrandingData } from "@/data/branding-storage";
import { getServicesWithStatus } from "@/lib/monitoring/database";

export default async function Home() {
	const { env } = getCloudflareContext();
	const bData = await getBrandingData(env);

	// Fetch services with monitoring data
	let services: Awaited<ReturnType<typeof getServicesWithStatus>> = [];
	try {
		if (env.RELAY_PULSE_DB) {
			services = await getServicesWithStatus(env.RELAY_PULSE_DB);
		}
	} catch (error) {
		console.error("Failed to fetch services:", error);
	}

	// Split services: First 2 for pinned cards, rest for list
	const pinnedServices = services.slice(0, 2);
	const listServices = services.slice(2);

	return (
		<main className="flex flex-col items-stretch mx-auto px-4 w-full max-w-[64rem]">
			<MainNav className="border-b h-16" bData={bData} />
			<div className="flex-1 space-y-4 pt-6">
				<Alert className="p-4">
					<AlertCircleIcon />
					<AlertTitle className="font-bold text-sm">
						{bData?.alert ?? "All Services Operational!"}
					</AlertTitle>
				</Alert>
				<div className="gap-4 grid sm:grid-cols-1 md:grid-cols-2">
					{pinnedServices.length > 0 ? (
						pinnedServices.map((service) => (
							<PinnedPulseCard
								key={service.id}
								title={service.name}
								link={`${service.type}://${service.address}${service.port && service.port !== 80 && service.port !== 443 ? `:${service.port}` : ""}`}
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
								status={service.status}
								uptime={service.uptime}
								responseTime={service.responseTime}
							/>
						))
					) : (
						<>
							<PinnedPulseCard
								title="No Services"
								link="#"
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
						</>
					)}
				</div>
			</div>
			{listServices.length > 0 && (
				<div className="flex flex-col gap-4 mt-8 mb-4">
					<h3>All Services:</h3>
					{listServices.map((service) => (
						<LinePulseCard
							key={service.id}
							title={service.name}
							link={`${service.type}://${service.address}${service.port && service.port !== 80 && service.port !== 443 ? `:${service.port}` : ""}`}
							status={service.status}
							uptime={service.uptime}
							responseTime={service.responseTime}
						/>
					))}
				</div>
			)}
		</main>
	);
}
