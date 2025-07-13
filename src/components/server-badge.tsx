import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ServerBadge({
	className,
	children,
}: {
	className?: string;
	children: any;
}) {
	return (
		<Badge variant="outline" className={cn("gap-1.5", className)}>
			<span
				className="bg-purple-500 rounded-full size-1.5"
				aria-hidden="true"
			></span>
			{children}
		</Badge>
	);
}
