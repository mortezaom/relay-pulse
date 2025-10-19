"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationChannelDialog } from "@/components/dashboard/notification-channel-dialog";
import { NotificationChannelsList } from "@/components/dashboard/notification-channels-list";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { NotificationChannel } from "@/lib/notifications/types";

export default function NotificationsPage() {
	const [channels, setChannels] = useState<NotificationChannel[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingChannel, setEditingChannel] =
		useState<NotificationChannel | null>(null);

	const loadChannels = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/notification-channels");
			const data: any = await response.json();

			if (data.ok) {
				setChannels(data.data.channels);
			} else {
				toast.error("Failed to load channels");
			}
		} catch (error) {
			console.error("Failed to load channels:", error);
			toast.error("Failed to load channels");
		} finally {
			setLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: ignore
	useEffect(() => {
		void loadChannels();
	}, []);

	const handleAdd = () => {
		setEditingChannel(null);
		setDialogOpen(true);
	};

	const handleEdit = (channel: NotificationChannel) => {
		setEditingChannel(channel);
		setDialogOpen(true);
	};

	const handleDelete = async (channelId: string) => {
		if (
			!confirm("Are you sure you want to delete this notification channel?")
		) {
			return;
		}

		try {
			const response = await fetch(`/api/notification-channels/${channelId}`, {
				method: "DELETE",
			});

			const data: any = await response.json();

			if (data.ok) {
				toast.success("Channel deleted successfully");
				void loadChannels();
			} else {
				toast.error(data.message || "Failed to delete channel");
			}
		} catch (error) {
			console.error("Failed to delete channel:", error);
			toast.error("Failed to delete channel");
		}
	};

	const handleToggle = async (channelId: string, enabled: boolean) => {
		try {
			const response = await fetch(`/api/notification-channels/${channelId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ enabled }),
			});

			const data: any = await response.json();

			if (data.ok) {
				toast.success(enabled ? "Channel enabled" : "Channel disabled");
				void loadChannels();
			} else {
				toast.error(data.message || "Failed to update channel");
			}
		} catch (error) {
			console.error("Failed to toggle channel:", error);
			toast.error("Failed to update channel");
		}
	};

	const handleSaved = () => {
		setDialogOpen(false);
		loadChannels();
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Notifications</h1>
					<p className="mt-2 text-muted-foreground">
						Manage notification channels and alert settings
					</p>
				</div>
				<Button onClick={handleAdd} size="lg">
					<Plus className="mr-2 size-4" />
					Add Channel
				</Button>
			</div>

			{/* Info Card */}
			<Card>
				<CardHeader>
					<CardTitle>Notification Channels</CardTitle>
					<CardDescription>
						Configure where you want to receive alerts when your services go
						down. Supports Telegram, Discord, Slack, Email, ntfy, Gotify, and
						Apprise.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<NotificationChannelsList
						channels={channels}
						loading={loading}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onToggle={handleToggle}
					/>
				</CardContent>
			</Card>

			{/* Add/Edit Dialog */}
			<NotificationChannelDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				channel={editingChannel}
				onSaved={handleSaved}
			/>
		</div>
	);
}
