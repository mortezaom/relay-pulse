import { getCloudflareContext } from "@opennextjs/cloudflare";
import AuthForm from "@/components/auth-form";
import { LogoVector } from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { isDashboardInitialized } from "@/data/user-storage";

const AuthPage = async () => {
	const isInitialized = await isDashboardInitialized(
		getCloudflareContext().env,
	);

	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm flex flex-col gap-6">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-4">
						<div className="flex flex-col items-center gap-2 font-medium">
							<div className="flex size-8 items-center justify-center rounded-md">
								<LogoVector className="size-12" />
							</div>
							<span className="sr-only">Relay Pulse</span>
						</div>
						<h1 className="text-xl font-bold">
							Welcome to Relay Pulse.
						</h1>
					</div>
					<AuthForm isInitialized={isInitialized} />
					<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
				</div>
				<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
					By clicking continue, you agree to RelayPulse Terms of
					Service and Privacy Policy.
				</div>
			</div>
			<ThemeSwitcher className="absolute top-4 right-4" />
		</div>
	);
};

export default AuthPage;
