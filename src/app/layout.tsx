import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Relay Pulse",
	description: "Uptime monitoring and status page",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">{children}</body>
		</html>
	);
}
