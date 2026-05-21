import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import { DadModeProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "DadMode",
  description: "A calm family command center for tired parents.",
  applicationName: "DadMode",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DadMode"
  }
};

export const viewport: Viewport = {
  themeColor: "#f9735b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <DadModeProvider>
          <AppShell>{children}</AppShell>
          <PwaRegister />
        </DadModeProvider>
      </body>
    </html>
  );
}
