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
    <Badge className={cn("gap-1.5", className)} variant={variant}>
      <span aria-hidden="true" className={cn(color, "size-1.5 rounded-full")} />
      {status?.toUpperCase() || "UNKNOWN"}
    </Badge>
  );
}
