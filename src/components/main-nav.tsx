import type { BrandingDataType } from "@/data/branding-data";
import { cn } from "@/lib/utils";
import { LogoVector } from "./icons";
import { ThemeSwitcher } from "./theme-switcher";

export function MainNav(props: {
  className?: string;
  bData: BrandingDataType | null;
}) {
  return (
    <nav
      className={cn("flex items-center justify-between px-2", props.className)}
    >
      <div className="flex items-center space-x-4 lg:space-x-6">
        <a className="flex size-12 items-center justify-center" href="/">
          {props.bData?.imageUrl ? (
            // biome-ignore lint/performance/noImgElement: no-optimization needed
            <img
              alt="Logo"
              className="size-6"
              height="24"
              src={props.bData.imageUrl}
              width="24"
            />
          ) : (
            <LogoVector className="size-6" />
          )}
        </a>
      </div>

      <div className="flex items-center justify-end gap-2">
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
