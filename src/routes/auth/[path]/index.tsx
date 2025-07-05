import { LogoType } from "~/components/logo-type";
import { UserAuthForm } from "~/components/user-auth-form";

export default () => {
	return (
		<div class="relative flex flex-col justify-center items-center lg:grid lg:grid-cols-2 bg-zinc-900 lg:px-0 lg:max-w-none h-[100vh] text-black dark:text-white container">
			<div class="hidden relative lg:flex flex-col bg-[#e4e4e4] dark:bg-background p-10 dark:border-r h-full">
				<div class="absolute inset-0" />
				<LogoType />
				<div class="z-20 relative mt-auto">
					<blockquote class="space-y-2">
						<p class="font-medium">
							"Relay Pulse is a powerful tool for monitoring and managing your
							Online Services, providing historical uptime data"
						</p>
					</blockquote>
				</div>
			</div>
			<div class="p-6 lg:p-8 w-full">
				<LogoType class="lg:hidden top-10 left-10 absolute" />
				<div class="flex flex-col justify-center space-y-6 mx-auto w-full max-w-[550px]">
					<div class="flex flex-col space-y-2 w-full text-start">
						<h1 class="font-semibold text-white text-2xl tracking-tight">
							Access the Dashboard
						</h1>
						<p class="text-[#8f8f8f] dark:text-muted-foreground text-sm">
							Enter the your authentication details below:
						</p>
					</div>
					<UserAuthForm />
				</div>
			</div>
		</div>
	);
};
