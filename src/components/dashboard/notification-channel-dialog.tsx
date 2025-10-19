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

interface NotificationChannelDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	channel?: NotificationChannel | null;
	onSaved: () => void;
}

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
				setCredentials({ provider: channel.provider } as any);
			} else {
				setName("");
				setProvider("telegram");
				setEnabled(true);
				setCredentials({ provider: "telegram" } as any);
			}
		}
	}, [open, channel]);

	const handleProviderChange = (newProvider: NotificationProvider) => {
		setProvider(newProvider);
		// Reset credentials when provider changes
		setCredentials({ provider: newProvider } as any);
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

			const data: any = await response.json();

			if (data.ok) {
				toast.success("Test notification sent successfully!");
			} else {
				toast.error(
					data.message || "Test failed. Please check your credentials.",
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

			const body: any = {
				name,
				provider,
				enabled,
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

			const data: any = await response.json();

			if (data.ok) {
				toast.success(
					channel
						? "Channel updated successfully"
						: "Channel created successfully",
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

	const updateCredential = (key: string, value: any) => {
		setCredentials((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
							placeholder="e.g., Production Alerts"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					{/* Provider Selection */}
					<div className="space-y-2">
						<Label htmlFor="provider">Provider</Label>
						<Select
							value={provider}
							onValueChange={handleProviderChange}
							disabled={!!channel} // Can't change provider when editing
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
									),
								)}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							{providerInfo[provider].description}
						</p>
					</div>

					{/* Provider-Specific Credentials */}
					<ProviderCredentialsForm
						provider={provider}
						credentials={credentials}
						onChange={updateCredential}
					/>

					{/* Enabled Switch */}
					<div className="flex justify-between items-center">
						<div>
							<Label htmlFor="enabled">Enabled</Label>
							<p className="text-muted-foreground text-sm">
								Receive notifications through this channel
							</p>
						</div>
						<Switch
							id={"enabled"}
							checked={enabled}
							onCheckedChange={setEnabled}
						/>
					</div>

					{/* Setup Guide */}
					{providerInfo[provider].setupGuide && (
						<div className="space-y-2 bg-muted p-4 rounded-lg">
							<Label className="font-semibold text-sm">Setup Guide</Label>
							<pre className="text-xs whitespace-pre-wrap">
								{providerInfo[provider].setupGuide}
							</pre>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleTest}
						disabled={testing || saving}
					>
						{testing ? "Testing..." : "Test"}
					</Button>
					<Button onClick={handleSave} disabled={testing || saving}>
						{saving ? "Saving..." : channel ? "Update" : "Create"}
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
					type="password"
					placeholder="1234567890:ABCdefGhIJKlmNOPQRstuVWXYZ"
					value={credentials.botToken || ""}
					onChange={(e) => onChange("botToken", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Chat ID</Label>
				<Input
					placeholder="123456789"
					value={credentials.chatId || ""}
					onChange={(e) => onChange("chatId", e.target.value)}
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
					placeholder="https://discord.com/api/webhooks/..."
					value={credentials.webhookUrl || ""}
					onChange={(e) => onChange("webhookUrl", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Username (optional)</Label>
				<Input
					placeholder="Relay Pulse"
					value={credentials.username || ""}
					onChange={(e) => onChange("username", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Avatar URL (optional)</Label>
				<Input
					placeholder="https://..."
					value={credentials.avatarUrl || ""}
					onChange={(e) => onChange("avatarUrl", e.target.value)}
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
					placeholder="https://hooks.slack.com/services/..."
					value={credentials.webhookUrl || ""}
					onChange={(e) => onChange("webhookUrl", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Channel (optional)</Label>
				<Input
					placeholder="#alerts"
					value={credentials.channel || ""}
					onChange={(e) => onChange("channel", e.target.value)}
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
			<div className="space-y-2 bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
				<p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
					📧 Using Resend Email API
				</p>
				<p className="text-blue-700 dark:text-blue-300 text-xs">
					Free tier: <strong>100 emails/day</strong>, 3,000 emails/month
				</p>
				<p className="text-blue-700 dark:text-blue-300 text-xs">
					Paid plans start at <strong>$20/month</strong> for 50,000 emails/month
				</p>
				<a
					href="https://resend.com/signup"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs hover:underline"
				>
					Sign up at resend.com →
				</a>
			</div>

			<div className="space-y-2">
				<Label>Resend API Key</Label>
				<Input
					type="password"
					placeholder="re_xxxxxxxxxxxx"
					value={credentials.resendApiKey || ""}
					onChange={(e) => onChange("resendApiKey", e.target.value)}
				/>
				<p className="text-muted-foreground text-xs">
					Get your API key from{" "}
					<a
						href="https://resend.com/api-keys"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 dark:text-blue-400 hover:underline"
					>
						resend.com/api-keys
					</a>
				</p>
			</div>

			<div className="space-y-2">
				<Label>From Email</Label>
				<Input
					type="email"
					placeholder="alerts@yourdomain.com"
					value={credentials.fromEmail || ""}
					onChange={(e) => onChange("fromEmail", e.target.value)}
				/>
				<p className="text-muted-foreground text-xs">
					Must be from a verified domain in{" "}
					<a
						href="https://resend.com/domains"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 dark:text-blue-400 hover:underline"
					>
						your Resend account
					</a>
				</p>
			</div>

			<div className="space-y-2">
				<Label>To Emails (comma-separated)</Label>
				<Input
					placeholder="user1@example.com, user2@example.com"
					value={credentials.toEmails?.join(", ") || ""}
					onChange={(e) =>
						onChange(
							"toEmails",
							e.target.value.split(",").map((email) => email.trim()),
						)
					}
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
					placeholder="https://ntfy.sh"
					value={credentials.serverUrl || ""}
					onChange={(e) => onChange("serverUrl", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Topic</Label>
				<Input
					placeholder="my-topic-name"
					value={credentials.topic || ""}
					onChange={(e) => onChange("topic", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Auth Token (optional)</Label>
				<Input
					type="password"
					placeholder="tk_..."
					value={credentials.token || ""}
					onChange={(e) => onChange("token", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Priority (1-5, default: 3)</Label>
				<Input
					type="number"
					min="1"
					max="5"
					placeholder="3"
					value={credentials.priority || 3}
					onChange={(e) =>
						onChange("priority", Number.parseInt(e.target.value, 10))
					}
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
					placeholder="https://gotify.example.com"
					value={credentials.serverUrl || ""}
					onChange={(e) => onChange("serverUrl", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>App Token</Label>
				<Input
					type="password"
					placeholder="A..."
					value={credentials.appToken || ""}
					onChange={(e) => onChange("appToken", e.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label>Priority (0-10, default: 5)</Label>
				<Input
					type="number"
					min="0"
					max="10"
					placeholder="5"
					value={credentials.priority || 5}
					onChange={(e) =>
						onChange("priority", Number.parseInt(e.target.value, 10))
					}
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
					placeholder="https://apprise.example.com/notify"
					value={credentials.appriseUrl || ""}
					onChange={(e) => onChange("appriseUrl", e.target.value)}
				/>
			</div>
		</div>
	);
}
