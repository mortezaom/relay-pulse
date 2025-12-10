import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PulseCardContent, PulseLineCardContent } from "./pulse-card-content";

const getStatusLabel = (s?: string): string => {
  switch (s) {
    case "up":
      return "Operational";
    case "down":
      return "Down";
    case "timeout":
      return "Timeout";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
};

export const PinnedPulseCard = ({
  title,
  link,
  icon,
  status,
  uptime,
  responseTime,
}: {
  title: string;
  link: string;
  icon: React.ReactNode;
  status?: "up" | "down" | "timeout" | "error";
  uptime?: number;
  responseTime?: number;
}) => (
  <Card className="flex flex-col items-stretch justify-between">
    <CardHeader className="flex w-full flex-col items-stretch">
      <div className="flex w-full items-center justify-between">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {icon}
      </div>
      <CardDescription>
        <a className="font-bold text-xs underline" href={link} target="_blank">
          {link}
        </a>
      </CardDescription>
    </CardHeader>
    <PulseCardContent
      responseTime={responseTime}
      status={status}
      uptime={uptime}
    />
  </Card>
);

export const LinePulseCard = ({
  title,
  link,
  status,
  uptime,
  responseTime,
}: {
  title: string;
  link: string;
  status?: "up" | "down" | "timeout" | "error";
  uptime?: number;
  responseTime?: number;
}) => {
  const statusLabel = getStatusLabel(status);

  return (
    <Card className="flex flex-col items-stretch justify-between">
      <CardHeader className="flex w-full flex-col items-start">
        <div className="flex w-full items-center justify-between">
          <CardTitle className="gap-1 font-medium text-sm">
            <a
              className="flex items-center gap-1 border-border border-b-2 border-dashed transition-all hover:opacity-70"
              href={link}
              target="_blank"
            >
              <span>{title}</span>

              <svg
                aria-hidden="true"
                fill="currentColor"
                height="16"
                viewBox="0 0 256 256"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
              </svg>
            </a>
          </CardTitle>
          <span className="font-bold text-blue text-muted-foreground text-sm">
            {statusLabel}
          </span>
        </div>
      </CardHeader>
      <PulseLineCardContent
        responseTime={responseTime}
        status={status}
        uptime={uptime}
      />
    </Card>
  );
};
