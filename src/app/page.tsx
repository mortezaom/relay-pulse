import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AlertCircleIcon } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { LinePulseCard, PinnedPulseCard } from "@/components/pulse-card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import GlitchText from "@/components/ui/shadcn-io/glitch-text";
import { getBrandingData } from "@/data/branding-storage";
import { getServicesWithStatus } from "@/lib/monitoring/database";

export default async function Home() {
  const { env } = getCloudflareContext();
  const bData = await getBrandingData(env);

  let services: Awaited<ReturnType<typeof getServicesWithStatus>> = [];
  try {
    if (env.RELAY_PULSE_DB) {
      services = await getServicesWithStatus(env.RELAY_PULSE_DB);
    }
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  // First 2 for pinned cards, rest for list
  const pinnedServices = services.slice(0, 2);
  const listServices = services.slice(2);

  return (
    <main className="mx-auto flex w-full max-w-[64rem] flex-col items-stretch px-4">
      <MainNav bData={bData} className="h-16 border-b" />
      {services.length === 0 ? (
        <div className="my-12 flex-1 space-y-4 pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle className="font-black font-mono text-8xl">
                <GlitchText
                  className="text-center"
                  enableOnHover={true}
                  enableShadows={true}
                  speed={1}
                >
                  404
                </GlitchText>
              </EmptyTitle>
              <EmptyDescription className="text-nowrap text-lg">
                There is no Service or Website to monitor yet. <br />
                Maybe on your next visit? 😉
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 pt-6">
            <Alert className="p-4">
              <AlertCircleIcon />
              <AlertTitle className="font-bold text-sm">
                {bData?.alert ?? "All Services Operational!"}
              </AlertTitle>
            </Alert>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {pinnedServices.length > 0 ? (
                pinnedServices.map((service) => (
                  <PinnedPulseCard
                    icon={
                      <svg
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    }
                    key={service.id}
                    link={`${service.type}://${service.address}${service.port && service.port !== 80 && service.port !== 443 ? `:${service.port}` : ""}`}
                    responseTime={service.responseTime}
                    status={service.status}
                    title={service.name}
                    uptime={service.uptime}
                  />
                ))
              ) : (
                <PinnedPulseCard
                  icon={
                    <svg
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  }
                  link="#"
                  title="No Services"
                />
              )}
            </div>
          </div>
          {listServices.length > 0 && (
            <div className="mt-8 mb-4 flex flex-col gap-4">
              <h3>All Services:</h3>
              {listServices.map((service) => (
                <LinePulseCard
                  key={service.id}
                  link={`${service.type}://${service.address}${service.port && service.port !== 80 && service.port !== 443 ? `:${service.port}` : ""}`}
                  responseTime={service.responseTime}
                  status={service.status}
                  title={service.name}
                  uptime={service.uptime}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
