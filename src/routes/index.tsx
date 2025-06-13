import { IconDownload } from "~/components/icons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Callout, CalloutTitle } from "~/components/ui/callout";

import { MainNav } from "~/components/main-nav";
import { For } from "solid-js";

export default () => {
	const arrayOfLines = Array.from({ length: 50 }).map((_, i) => 100);

	return (
		<main>
			<div class="flex flex-col items-center">
				<MainNav class="flex justify-between items-center px-4 border-b h-16 max-width-con" />
				<div class="flex-1 space-y-4 pt-6 max-width-con">
					<Callout variant="success" class="p-4">
						<CalloutTitle class="font-bold text-sm">
							All Services Operational!
						</CalloutTitle>
					</Callout>
					<div class="gap-4 grid sm:grid-cols-1 md:grid-cols-2">
						<Card class="flex flex-col justify-between items-stretch">
							<CardHeader class="flex flex-col items-start space-y-0 p-4 w-full">
								<div class="flex justify-between items-center mb-0.5 w-full">
									<CardTitle class="font-medium text-sm">Server #2</CardTitle>
									<div class="flex gap-1 font-semibold text-xs">
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											class="size-4 text-muted-foreground"
											>
											<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
										</svg>
											50d
									</div>
								</div>
								<CardDescription>
									<a
										class="font-bold text-xs underline"
										href="https://mortezaom.dev"
									>
										https://mortezaom.dev
									</a>
								</CardDescription>
							</CardHeader>
							<CardContent class="p-4 pt-2">
								<div class="flex sm:flex-row flex-col items-stretch gap-0.5 h-16 sm:h-8">
									<ul class="flex items-stretch gap-0.5 w-full h-8">
										<For each={arrayOfLines.slice(0, 25)}>
											{(item, index) => (
												<li class="bg-green-500 rounded-sm w-full" />
											)}
										</For>
									</ul>
									<ul class="flex items-stretch gap-0.5 w-full h-8">
										<For each={arrayOfLines.slice(25)}>
											{(item, index) => (
												<li class="bg-green-500 rounded-sm w-full" />
											)}
										</For>
									</ul>
								</div>
								<p class="flex justify-between items-center mt-2 font-bold text-muted-foreground text-xs">
									<span>Operational</span>
									<span>Uptime 99%</span>
								</p>
							</CardContent>
						</Card>
						<Card class="flex flex-col justify-between items-stretch">
							<CardHeader class="flex flex-col items-start space-y-0 p-4 w-full">
								<div class="flex justify-between items-center mb-0.5 w-full">
									<CardTitle class="font-medium text-sm">Server #2</CardTitle>
									<svg
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										class="size-4 text-muted-foreground"
									>
										<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
									</svg>
								</div>
								<CardDescription>
									<a
										class="font-bold text-xs underline"
										href="https://mortezaom.dev"
									>
										https://mortezaom.dev
									</a>
								</CardDescription>
							</CardHeader>
							<CardContent class="p-4 pt-2">
								<div class="flex sm:flex-row flex-col items-stretch gap-0.5 h-16 sm:h-8">
									<ul class="flex items-stretch gap-0.5 w-full h-8">
										<For each={arrayOfLines.slice(0, 25)}>
											{(item, index) => (
												<li class="bg-green-500 rounded-sm w-full" />
											)}
										</For>
									</ul>
									<ul class="flex items-stretch gap-0.5 w-full h-8">
										<For each={arrayOfLines.slice(25)}>
											{(item, index) => (
												<li class="bg-green-500 rounded-sm w-full" />
											)}
										</For>
									</ul>
								</div>
								<p class="flex justify-between items-center mt-2 font-bold text-muted-foreground text-xs">
									<span>Operational</span>
									<span>Uptime 99%</span>
								</p>
							</CardContent>
						</Card>
					</div>
					<div class="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle class="font-medium text-sm">Total Revenue</CardTitle>
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
								</svg>
							</CardHeader>
							<CardContent>
								<div class="font-bold text-2xl">$45,231.89</div>
								<p class="text-muted-foreground text-xs">
									+20.1% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle class="font-medium text-sm">Subscriptions</CardTitle>
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
							</CardHeader>
							<CardContent>
								<div class="font-bold text-2xl">+2350</div>
								<p class="text-muted-foreground text-xs">
									+180.1% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle class="font-medium text-sm">Sales</CardTitle>
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<rect width="20" height="14" x="2" y="5" rx="2" />
									<path d="M2 10h20" />
								</svg>
							</CardHeader>
							<CardContent>
								<div class="font-bold text-2xl">+12,234</div>
								<p class="text-muted-foreground text-xs">
									+19% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle class="font-medium text-sm">Active Now</CardTitle>
								<svg
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									class="size-4 text-muted-foreground"
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							</CardHeader>
							<CardContent>
								<div class="font-bold text-2xl">+573</div>
								<p class="text-muted-foreground text-xs">
									+201 since last hour
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
};
