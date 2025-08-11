import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BrandingForm } from "@/components/dashboard/branding-form";
import { ServicesList } from "@/components/dashboard/services-list";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrandingData } from "@/data/branding-storage";

export default async function Dashboard() {
	const data = await getBrandingData(getCloudflareContext().env);

	return (
		<main className="flex flex-col items-stretch gap-8 mx-auto px-4 pb-24 w-full max-w-[64rem]">
			<DashboardNav className="px-2 border-b h-16" />
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Branding Details</CardTitle>
				</CardHeader>
				<CardContent>
					<BrandingForm data={data} />
				</CardContent>
			</Card>
			<ServicesList />
		</main>
	);
}
