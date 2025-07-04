import { IconCommand } from "~/components/icons";
import { buttonVariants } from "~/components/ui/button";
import { UserAuthForm } from "~/components/user-auth-form";
import { cn } from "~/lib/utils";

export default () => {
	return (
		<div class="relative flex-col justify-center items-center md:grid lg:grid-cols-2 lg:px-0 lg:max-w-none h-[100vh] container">
			<a
				href="/examples/authentication"
				class={cn(
					buttonVariants({ variant: "ghost" }),
					"absolute right-4 top-4 md:right-8 md:top-8",
				)}
			>
				Login
			</a>
			<div class="hidden relative lg:flex flex-col bg-muted p-10 dark:border-r h-full text-white">
				<div class="absolute inset-0 bg-zinc-900" />
				<div class="z-20 relative flex items-center font-medium text-lg">
					<IconCommand class="mr-2 size-6" />
					Acme Inc
				</div>
				<div class="z-20 relative mt-auto">
					<blockquote class="space-y-2">
						<p class="text-lg">
							&ldquo;This library has saved me countless hours of work and
							helped me deliver stunning designs to my clients faster than ever
							before.&rdquo;
						</p>
						<footer class="text-sm">Sofia Davis</footer>
					</blockquote>
				</div>
			</div>
			<div class="lg:p-8">
				<div class="flex flex-col justify-center space-y-6 mx-auto w-full sm:w-[350px]">
					<div class="flex flex-col space-y-2 text-center">
						<h1 class="font-semibold text-2xl tracking-tight">
							Create an account
						</h1>
						<p class="text-muted-foreground text-sm">
							Enter your email below to create your account
						</p>
					</div>
					<UserAuthForm />
					<p class="px-8 text-muted-foreground text-sm text-center">
						By clicking continue, you agree to our{" "}
						<a
							href="/terms"
							class="hover:text-primary underline underline-offset-4"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							class="hover:text-primary underline underline-offset-4"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
};
