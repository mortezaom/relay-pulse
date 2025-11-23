import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Toaster } from "@/components/ui/sonner";
import { getBrandingData } from "@/data/branding-storage";

const defaultMeta = {
  title: "Relay Pulse",
  description: "Uptime monitoring and status page | Relay Pulse",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getBrandingData(getCloudflareContext().env);

    return {
      title: data?.title ?? defaultMeta.title,
      description: data?.description ?? defaultMeta.description,
    };
  } catch {
    return defaultMeta;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="light"
      lang="en"
      style={{
        colorScheme: "light",
      }}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
