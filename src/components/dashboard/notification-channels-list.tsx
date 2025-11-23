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

type NotificationChannelsListProps = {
  channels: NotificationChannel[];
  loading: boolean;
  onEdit: (channel: NotificationChannel) => void;
  onDelete: (channelId: string) => void;
  onToggle: (channelId: string, enabled: boolean) => void;
};

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
        {[...new Array(3)].map((_, i) => (
          <div className="flex items-center gap-4" key={`skeleton-${i}`}>
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
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
    <div className="rounded-lg border">
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
                  <Badge className="capitalize" variant="outline">
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => onEdit(channel)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="mr-1 size-4" />
                      Edit
                    </Button>
                    <Button
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(channel.id)}
                      size="sm"
                      variant="ghost"
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
