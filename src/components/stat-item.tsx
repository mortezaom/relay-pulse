import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { LineStatsContent } from "./line-stats-content";

export const StatItem = ({ title, link }: { title: string; link: string }) => {
	return (
		<Card class="flex flex-col justify-between items-stretch">
			<CardHeader class="flex flex-col items-start space-y-0 p-4 w-full">
				<div class="flex justify-between items-center mb-0.5 w-full">
					<CardTitle class="gap-1 font-medium text-sm">
						<a
							href={link}
							class="flex items-center gap-1 hover:opacity-70 border-white border-b border-dashed transition-all"
						>
							<span>{title}</span>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								viewBox="0 0 256 256"
							>
								<path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path>
							</svg>
						</a>
					</CardTitle>
					<span class="font-bold text-blue text-muted-foreground text-sm">Operational</span>
				</div>
			</CardHeader>
			<LineStatsContent uptime="99" />
		</Card>
	);
};
