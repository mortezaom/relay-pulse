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
      const data = (await response.json()) as {
        ok: boolean;
        data: { channels: NotificationChannel[] };
      };

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
    loadChannels();
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
      // TODO: Replace with a custom modal dialog
      // biome-ignore lint/suspicious/noAlert: waiting for custom modal
      !confirm("Are you sure you want to delete this notification channel?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/notification-channels/${channelId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { ok: boolean; message?: string };

      if (data.ok) {
        toast.success("Channel deleted successfully");
        loadChannels();
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

      const data = (await response.json()) as { ok: boolean; message?: string };

      if (data.ok) {
        toast.success(enabled ? "Channel enabled" : "Channel disabled");
        loadChannels();
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
      <div className="flex items-center justify-between">
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
            onDelete={handleDelete}
            onEdit={handleEdit}
            onToggle={handleToggle}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <NotificationChannelDialog
        channel={editingChannel}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        open={dialogOpen}
      />
    </div>
  );
}
