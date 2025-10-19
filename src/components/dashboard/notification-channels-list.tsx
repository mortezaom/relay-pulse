/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
"use client";

import { Bell, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { providerInfo } from "@/data/notification-channels-data";
import type { NotificationChannel } from "@/lib/notifications/types";

interface NotificationChannelsListProps {
	channels: NotificationChannel[];
	loading: boolean;
	onEdit: (channel: NotificationChannel) => void;
	onDelete: (channelId: string) => void;
	onToggle: (channelId: string, enabled: boolean) => void;
}

export function NotificationChannelsList({
	channels,
	loading,
	onEdit,
	onDelete,
	onToggle,
}: NotificationChannelsListProps) {
	if (loading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={`skeleton-${i}`} className="flex items-center gap-4">
						<Skeleton className="rounded-lg w-12 h-12" />
						<div className="flex-1 space-y-2">
							<Skeleton className="w-1/3 h-4" />
							<Skeleton className="w-1/2 h-3" />
						</div>
						<Skeleton className="w-24 h-10" />
					</div>
				))}
			</div>
		);
	}

	if (channels.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center py-12 text-center">
				<div className="bg-muted mb-4 p-6 rounded-full">
					<Bell className="size-12 text-muted-foreground" />
				</div>
				<h3 className="mb-2 font-semibold text-lg">
					No notification channels yet
				</h3>
				<p className="max-w-md text-muted-foreground">
					Add your first notification channel to start receiving alerts when
					your services go down.
				</p>
			</div>
		);
	}

	return (
		<div className="border rounded-lg">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Channel</TableHead>
						<TableHead>Provider</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{channels.map((channel) => {
						const info = providerInfo[channel.provider];

						return (
							<TableRow key={channel.id}>
								<TableCell>
									<div className="flex flex-col">
										<span className="font-medium">{channel.name}</span>
										<span className="text-muted-foreground text-xs">
											{new Date(channel.createdAt).toLocaleDateString()}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className="capitalize">
										{info.name}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Switch
											checked={channel.enabled}
											onCheckedChange={(checked) =>
												onToggle(channel.id, checked)
											}
										/>
										<span className="text-muted-foreground text-sm">
											{channel.enabled ? "Enabled" : "Disabled"}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex justify-end items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onEdit(channel)}
										>
											<Edit2 className="mr-1 size-4" />
											Edit
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDelete(channel.id)}
											className="hover:bg-destructive/10 text-destructive hover:text-destructive"
										>
											<Trash2 className="mr-1 size-4" />
											Delete
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
