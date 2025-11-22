import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StatusBadge({
	status,
	className,
}: {
	status?: "up" | "down" | "timeout" | "error";
	className?: string;
}) {
	const variant = status === "up" ? "default" : "destructive";
	const color = {
		up: "bg-green-500",
		down: "bg-red-500",
		timeout: "bg-yellow-500",
		error: "bg-orange-500",
	}[status || "error"];

	return (
		<Badge variant={variant} className={cn("gap-1.5", className)}>
			<span className={cn(color, "rounded-full size-1.5")} aria-hidden="true" />
			{status?.toUpperCase() || "UNKNOWN"}
		</Badge>
	);
}
