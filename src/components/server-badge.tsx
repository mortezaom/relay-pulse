import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ServerBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge className={cn("gap-1.5", className)} variant="outline">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-purple-500"
      />
      {children}
    </Badge>
  );
}
