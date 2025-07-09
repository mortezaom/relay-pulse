import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	PulseCardContent,
	PulseLineCardContent,
} from "./pulse-card-content";

export const PinnedPulseCard = ({
	title,
	link,
	icon,
}: {
	title: string;
	link: string;
	icon: React.ReactNode;
}) => {
	return (
		<Card className="flex flex-col justify-between items-stretch">
			<CardHeader className="flex flex-col items-stretch w-full">
				<div className="flex justify-between items-center w-full">
					<CardTitle className="font-medium text-sm">
						{title}
					</CardTitle>
					{icon}
				</div>
				<CardDescription>
					<a
						className="font-bold text-xs underline"
						href={link}
						target="_blank"
					>
						{link}
					</a>
				</CardDescription>
			</CardHeader>
			<PulseCardContent />
		</Card>
	);
};

export const LinePulseCard = ({
	title,
	link,
}: {
	title: string;
	link: string;
}) => {
	return (
		<Card className="flex flex-col justify-between items-stretch">
			<CardHeader className="flex flex-col items-start w-full">
				<div className="flex justify-between items-center w-full">
					<CardTitle className="gap-1 font-medium text-sm">
						<a
							href={link}
							className="flex items-center gap-1 hover:opacity-70 border-border border-b-2 border-dashed transition-all"
							target="_blank"
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
					<span className="font-bold text-blue text-muted-foreground text-sm">
						Operational
					</span>
				</div>
			</CardHeader>
			<PulseLineCardContent />
		</Card>
	);
};
