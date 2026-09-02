import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DemoDataProvider } from "@/lib/demo-data/DemoDataProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexaFlow",
  description: "Manage work. Empower teams. Ship faster.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ThemeProvider><DemoDataProvider>{children}</DemoDataProvider></ThemeProvider></body>
    </html>
  );
}
