import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Suspense } from "react";
import "./globals.css";
import toast, { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AI Supply Chain Dashboard",
  description: "AI-powered supply chain management and optimization",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1">{children}</main>
            <Toaster />
          </SidebarProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
