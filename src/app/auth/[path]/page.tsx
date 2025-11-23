import { getCloudflareContext } from "@opennextjs/cloudflare";
import AuthForm from "@/components/auth-form";
import { LogoVector } from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { isDashboardInitialized } from "@/data/user-storage";

export default async function AuthPage() {
  const isInitialized = await isDashboardInitialized(
    getCloudflareContext().env
  );

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <LogoVector className="size-12" />
              </div>
              <span className="sr-only">Relay Pulse</span>
            </div>
            <h1 className="font-bold text-xl">Welcome to Relay Pulse.</h1>
          </div>
          <AuthForm isInitialized={isInitialized} />
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t" />
        </div>
        <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          By clicking continue, you agree to RelayPulse Terms of Service and
          Privacy Policy.
        </div>
      </div>
      <ThemeSwitcher className="absolute top-4 right-4" />
    </div>
  );
}
