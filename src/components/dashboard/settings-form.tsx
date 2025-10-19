"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
	tcpCheckerUrl?: string;
}

export function SettingsForm({ tcpCheckerUrl: initialUrl }: SettingsFormProps) {
	const [tcpCheckerUrl, setTcpCheckerUrl] = useState(initialUrl || "");
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		try {
			const response = await fetch("/api/settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tcpCheckerUrl,
				}),
			});

			const data: any = await response.json();

			if (data.ok) {
				toast.success("Settings saved successfully");
			} else {
				toast.error(data.message || "Failed to save settings");
			}
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleTest = async () => {
		if (!tcpCheckerUrl) {
			toast.error("Please enter a TCP checker URL first");
			return;
		}

		setTesting(true);
		try {
			const response = await fetch(tcpCheckerUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					host: "1.1.1.1", // Cloudflare DNS - should always be reachable
					port: 53, // DNS port
					timeout: 5000,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result: any = await response.json();

			if (result.reachable) {
				toast.success("TCP checker is working correctly! ✓");
			} else {
				toast.warning("TCP checker responded but test failed. Check your deployment.");
			}
		} catch (error) {
			console.error("Test failed:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to connect to TCP checker",
			);
		} finally {
			setTesting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="tcpCheckerUrl">TCP Checker Service URL</Label>
					<Input
						id="tcpCheckerUrl"
						type="url"
						placeholder="https://your-tcp-checker.example.com/check"
						value={tcpCheckerUrl}
						onChange={(e) => setTcpCheckerUrl(e.target.value)}
					/>
					<p className="text-muted-foreground text-xs">
						External service endpoint for TCP port monitoring (required for TCP
						services)
					</p>
				</div>

				<div className="space-y-3 bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-800 rounded-lg">
					<div className="flex items-start gap-2">
						<span className="text-amber-600 dark:text-amber-400 text-xl">
							⚠️
						</span>
						<div className="flex-1 space-y-2">
							<p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
								Why External TCP Checker?
							</p>
							<p className="text-amber-700 dark:text-amber-300 text-xs">
								Cloudflare Workers free tier doesn't support TCP socket
								connections. To monitor TCP ports, you need to deploy a
								lightweight Go service that can perform these checks and return
								results via HTTP.
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<p className="font-medium text-amber-900 dark:text-amber-100 text-xs">
							🚀 Quick Deploy Options:
						</p>
						<ul className="space-y-1 text-amber-700 dark:text-amber-300 text-xs">
							<li>
								• Deploy to any cloud provider (free tiers available on Fly.io,
								Railway, Render)
							</li>
							<li>• Run on your own server or VPS</li>
							<li>• Deploy as a Docker container</li>
						</ul>
					</div>

					<a
						href="https://github.com/mortezaom/relay-pulse-tcp-checker"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 font-medium text-amber-700 hover:text-amber-900 dark:hover:text-amber-100 dark:text-amber-300 text-xs hover:underline"
					>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
							<title>GitHub</title>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Get TCP Checker Service →
					</a>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={handleTest}
						disabled={testing || saving || !tcpCheckerUrl}
					>
						{testing ? "Testing..." : "Test Connection"}
					</Button>
					<Button onClick={handleSave} disabled={testing || saving}>
						{saving ? "Saving..." : "Save Settings"}
					</Button>
				</div>
			</div>
		</div>
	);
}
