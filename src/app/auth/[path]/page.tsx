"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { LogoVector } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
	const { setTheme, theme } = useTheme();

	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm flex flex-col gap-6">
				<form>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-4">
							<div className="flex flex-col items-center gap-2 font-medium">
								<div className="flex size-8 items-center justify-center rounded-md">
									<LogoVector className="size-12" />
								</div>
								<span className="sr-only">
									Relay Pulse
								</span>
							</div>
							<h1 className="text-xl font-bold">
								Welcome to Relay Pulse.
							</h1>
						</div>
						<div className="flex flex-col gap-6">
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id={"email"}
									type="email"
									placeholder="auth@example.com"
									required
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="password">Password</Label>
								<Input
									id={"password"}
									type="password"
									placeholder="--------"
									required
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="secret">Secret</Label>
								<Input
									id={"secret"}
									type="password"
									autoComplete="one-time-code"
									placeholder="--------"
									required
								/>
							</div>
							<Button type="submit" className="w-full">
								Submit
							</Button>
						</div>
						<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
					</div>
				</form>
				<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
					By clicking continue, you agree to RelayPulse Terms of
					Service and Privacy Policy.
				</div>
			</div>
			<button
				className="cursor-pointer absolute top-4 right-4 rounded-md p-2 transition-colors hover:bg-accent"
				type="button"
				onClick={() =>
					setTheme(theme === "dark" ? "light" : "dark")
				}
			>
				{theme === "light" ? (
					<MoonIcon className="size-5" />
				) : (
					<SunIcon className="size-5" />
				)}
			</button>
		</div>
	);
}
