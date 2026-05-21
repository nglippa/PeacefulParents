import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import { PeacefulParentsProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "PeacefulParents",
  description: "A calm family command center for tired parents.",
  applicationName: "PeacefulParents",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PeacefulParents"
  }
};

export const viewport: Viewport = {
  themeColor: "#2f4151",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PeacefulParentsProvider>
          <AppShell>{children}</AppShell>
          <PwaRegister />
        </PeacefulParentsProvider>
      </body>
    </html>
  );
}
