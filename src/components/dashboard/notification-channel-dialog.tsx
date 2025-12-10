/** biome-ignore-all lint/suspicious/noExplicitAny: complex, need type implementation */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { providerInfo } from "@/data/notification-channels-data";
import type {
  NotificationChannel,
  NotificationCredentials,
  NotificationProvider,
} from "@/lib/notifications/types";

type NotificationChannelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: NotificationChannel | null;
  onSaved: () => void;
};

export function NotificationChannelDialog({
  open,
  onOpenChange,
  channel,
  onSaved,
}: NotificationChannelDialogProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<NotificationProvider>("telegram");
  const [enabled, setEnabled] = useState(true);
  const [credentials, setCredentials] = useState<
    Partial<NotificationCredentials>
  >({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (channel) {
        setName(channel.name);
        setProvider(channel.provider);
        setEnabled(channel.enabled);
        // Note: credentials are not loaded for editing (security)
        setCredentials({ provider: channel.provider });
      } else {
        setName("");
        setProvider("telegram");
        setEnabled(true);
        setCredentials({ provider: "telegram" });
      }
    }
  }, [open, channel]);

  const handleProviderChange = (newProvider: NotificationProvider) => {
    setProvider(newProvider);
    // Reset credentials when provider changes
    setCredentials({ provider: newProvider });
  };

  const handleTest = async () => {
    try {
      setTesting(true);

      const response = await fetch("/api/notification-channels/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credentials }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (data.ok) {
        toast.success("Test notification sent successfully!");
      } else {
        toast.error(
          data.message || "Test failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Test failed. Please check your credentials.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a channel name");
      return;
    }

    try {
      setSaving(true);

      const url = channel
        ? `/api/notification-channels/${channel.id}`
        : "/api/notification-channels";

      const method = channel ? "PATCH" : "POST";

      const body = {
        name,
        provider,
        enabled,
        credentials: {},
      };

      // Only send credentials if creating or if they've been updated
      if (!channel || Object.keys(credentials).length > 1) {
        body.credentials = credentials;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (data.ok) {
        toast.success(
          channel
            ? "Channel updated successfully"
            : "Channel created successfully"
        );
        onSaved();
      } else {
        toast.error(data.message || "Failed to save channel");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save channel");
    } finally {
      setSaving(false);
    }
  };

  const updateCredential = (key: string, value: unknown) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const saveButton = channel ? "Update" : "Create";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {channel ? "Edit" : "Add"} Notification Channel
          </DialogTitle>
          <DialogDescription>
            Configure a notification channel to receive alerts when services go
            down.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id={"name"}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Alerts"
              value={name}
            />
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              disabled={!!channel}
              onValueChange={handleProviderChange}
              value={provider} // Can't change provider when editing
            >
              <SelectTrigger id={"provider"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(providerInfo) as NotificationProvider[]).map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {providerInfo[p].name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {providerInfo[provider].description}
            </p>
          </div>

          {/* Provider-Specific Credentials */}
          <ProviderCredentialsForm
            credentials={credentials}
            onChange={updateCredential}
            provider={provider}
          />

          {/* Enabled Switch */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Enabled</Label>
              <p className="text-muted-foreground text-sm">
                Receive notifications through this channel
              </p>
            </div>
            <Switch
              checked={enabled}
              id={"enabled"}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Setup Guide */}
          {providerInfo[provider].setupGuide && (
            <div className="space-y-2 rounded-lg bg-muted p-4">
              <Label className="font-semibold text-sm">Setup Guide</Label>
              <pre className="whitespace-pre-wrap text-xs">
                {providerInfo[provider].setupGuide}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={testing || saving}
            onClick={handleTest}
            variant="outline"
          >
            {testing ? "Testing..." : "Test"}
          </Button>
          <Button disabled={testing || saving} onClick={handleSave}>
            {saving ? "Saving..." : saveButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Provider-specific credential forms
function ProviderCredentialsForm({
  provider,
  credentials,
  onChange,
}: {
  provider: NotificationProvider;
  credentials: Partial<NotificationCredentials>;
  onChange: (key: string, value: any) => void;
}) {
  switch (provider) {
    case "telegram":
      return (
        <TelegramForm credentials={credentials as any} onChange={onChange} />
      );
    case "discord":
      return (
        <DiscordForm credentials={credentials as any} onChange={onChange} />
      );
    case "slack":
      return <SlackForm credentials={credentials as any} onChange={onChange} />;
    case "email":
      return <EmailForm credentials={credentials as any} onChange={onChange} />;
    case "ntfy":
      return <NtfyForm credentials={credentials as any} onChange={onChange} />;
    case "gotify":
      return (
        <GotifyForm credentials={credentials as any} onChange={onChange} />
      );
    case "apprise":
      return (
        <AppriseForm credentials={credentials as any} onChange={onChange} />
      );
    default:
      return null;
  }
}

// Individual provider forms
function TelegramForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Bot Token</Label>
        <Input
          onChange={(e) => onChange("botToken", e.target.value)}
          placeholder="1234567890:ABCdefGhIJKlmNOPQRstuVWXYZ"
          type="password"
          value={credentials.botToken || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Chat ID</Label>
        <Input
          onChange={(e) => onChange("chatId", e.target.value)}
          placeholder="123456789"
          value={credentials.chatId || ""}
        />
      </div>
    </div>
  );
}

function DiscordForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <Input
          onChange={(e) => onChange("webhookUrl", e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          value={credentials.webhookUrl || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Username (optional)</Label>
        <Input
          onChange={(e) => onChange("username", e.target.value)}
          placeholder="Relay Pulse"
          value={credentials.username || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Avatar URL (optional)</Label>
        <Input
          onChange={(e) => onChange("avatarUrl", e.target.value)}
          placeholder="https://..."
          value={credentials.avatarUrl || ""}
        />
      </div>
    </div>
  );
}

function SlackForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <Input
          onChange={(e) => onChange("webhookUrl", e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          value={credentials.webhookUrl || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Channel (optional)</Label>
        <Input
          onChange={(e) => onChange("channel", e.target.value)}
          placeholder="#alerts"
          value={credentials.channel || ""}
        />
      </div>
    </div>
  );
}

function EmailForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <p className="font-medium text-blue-900 text-sm dark:text-blue-100">
          📧 Using Resend Email API
        </p>
        <p className="text-blue-700 text-xs dark:text-blue-300">
          Free tier: <strong>100 emails/day</strong>, 3,000 emails/month
        </p>
        <p className="text-blue-700 text-xs dark:text-blue-300">
          Paid plans start at <strong>$20/month</strong> for 50,000 emails/month
        </p>
        <a
          className="inline-flex items-center gap-1 text-blue-600 text-xs hover:underline dark:text-blue-400"
          href="https://resend.com/signup"
          rel="noopener noreferrer"
          target="_blank"
        >
          Sign up at resend.com →
        </a>
      </div>

      <div className="space-y-2">
        <Label>Resend API Key</Label>
        <Input
          onChange={(e) => onChange("resendApiKey", e.target.value)}
          placeholder="re_xxxxxxxxxxxx"
          type="password"
          value={credentials.resendApiKey || ""}
        />
        <p className="text-muted-foreground text-xs">
          Get your API key from{" "}
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            href="https://resend.com/api-keys"
            rel="noopener noreferrer"
            target="_blank"
          >
            resend.com/api-keys
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label>From Email</Label>
        <Input
          onChange={(e) => onChange("fromEmail", e.target.value)}
          placeholder="alerts@yourdomain.com"
          type="email"
          value={credentials.fromEmail || ""}
        />
        <p className="text-muted-foreground text-xs">
          Must be from a verified domain in{" "}
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            href="https://resend.com/domains"
            rel="noopener noreferrer"
            target="_blank"
          >
            your Resend account
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label>To Emails (comma-separated)</Label>
        <Input
          onChange={(e) =>
            onChange(
              "toEmails",
              e.target.value.split(",").map((email) => email.trim())
            )
          }
          placeholder="user1@example.com, user2@example.com"
          value={credentials.toEmails?.join(", ") || ""}
        />
        <p className="text-muted-foreground text-xs">
          Enter one or more email addresses separated by commas
        </p>
      </div>
    </div>
  );
}

function NtfyForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Server URL</Label>
        <Input
          onChange={(e) => onChange("serverUrl", e.target.value)}
          placeholder="https://ntfy.sh"
          value={credentials.serverUrl || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Topic</Label>
        <Input
          onChange={(e) => onChange("topic", e.target.value)}
          placeholder="my-topic-name"
          value={credentials.topic || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Auth Token (optional)</Label>
        <Input
          onChange={(e) => onChange("token", e.target.value)}
          placeholder="tk_..."
          type="password"
          value={credentials.token || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Priority (1-5, default: 3)</Label>
        <Input
          max="5"
          min="1"
          onChange={(e) =>
            onChange("priority", Number.parseInt(e.target.value, 10))
          }
          placeholder="3"
          type="number"
          value={credentials.priority || 3}
        />
      </div>
    </div>
  );
}

function GotifyForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Server URL</Label>
        <Input
          onChange={(e) => onChange("serverUrl", e.target.value)}
          placeholder="https://gotify.example.com"
          value={credentials.serverUrl || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>App Token</Label>
        <Input
          onChange={(e) => onChange("appToken", e.target.value)}
          placeholder="A..."
          type="password"
          value={credentials.appToken || ""}
        />
      </div>
      <div className="space-y-2">
        <Label>Priority (0-10, default: 5)</Label>
        <Input
          max="10"
          min="0"
          onChange={(e) =>
            onChange("priority", Number.parseInt(e.target.value, 10))
          }
          placeholder="5"
          type="number"
          value={credentials.priority || 5}
        />
      </div>
    </div>
  );
}

function AppriseForm({
  credentials,
  onChange,
}: {
  credentials: any;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Apprise API URL</Label>
        <Input
          onChange={(e) => onChange("appriseUrl", e.target.value)}
          placeholder="https://apprise.example.com/notify"
          value={credentials.appriseUrl || ""}
        />
      </div>
    </div>
  );
}
