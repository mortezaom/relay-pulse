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
			className={cn("flex justify-between items-center px-2", props.className)}
		>
			<div className="flex items-center space-x-4 lg:space-x-6">
				<a href="/" className="flex justify-center items-center size-12">
					{props.bData?.imageUrl ? (
						// biome-ignore lint/performance/noImgElement: img, no optimization needed for logo
						<img src={props.bData.imageUrl} alt="Logo" className="size-6" />
					) : (
						<LogoVector className="size-6" />
					)}
				</a>
			</div>

			<div className="flex justify-end items-center gap-2">
				<ThemeSwitcher />
			</div>
		</nav>
	);
}
