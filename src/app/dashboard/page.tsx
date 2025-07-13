import { FileEditIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { BrandingForm } from "@/components/dashboard/branding-form";
import { DashboardNav } from "@/components/dashboard-nav";
import ServerBadge from "@/components/server-badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ServerType } from "@/data/servers-data";

const servers: ServerType[] = [
	{
		id: 1,
		name: "MortezaOM",
		address: "mortezaom.dev",
		type: "https",
	},
	{
		id: 2,
		name: "MortezaOM's DB",
		address: "192.168.1.1",
		type: "tcp",
		port: 5151,
	},
	{
		id: 3,
		name: "Bilit Test",
		address: "bill.mortezaom.dev",
		type: "http",
	},
];

export default function Dashboard() {
	return (
		<main className="flex flex-col items-stretch gap-8 mx-auto px-4 pb-24 w-full max-w-[64rem]">
			<DashboardNav className="px-2 border-b h-16" />
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Branding Details</CardTitle>
				</CardHeader>
				<CardContent>
					<BrandingForm />
				</CardContent>
			</Card>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Services</CardTitle>
					<CardAction>
						<Button variant="default" size="sm">
							<PlusCircleIcon /> New Service
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[100px]">
									#
								</TableHead>
								<TableHead>Name</TableHead>
								<TableHead className="text-center">
									Type
								</TableHead>
								<TableHead className="text-center">
									Address
								</TableHead>
								<TableHead className="text-center">
									Port
								</TableHead>
								<TableHead className="text-center">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{servers.map((server) => (
								<TableRow key={server.id}>
									<TableCell className="font-medium">
										{server.id}
									</TableCell>
									<TableCell>{server.name}</TableCell>
									<TableCell className="text-center">
										<ServerBadge>
											{server.type}
										</ServerBadge>
									</TableCell>
									<TableCell className="text-center">
										{server.address}
									</TableCell>
									<TableCell className="text-center">
										{server.port ??
											(server.type === "http"
												? "80"
												: "443")}
									</TableCell>
									<TableCell className="flex justify-center items-center gap-2">
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
										>
											<FileEditIcon />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											className="size-8"
										>
											<Trash2Icon />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</main>
	);
}
