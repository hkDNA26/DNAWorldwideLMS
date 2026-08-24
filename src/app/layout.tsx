import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DNA Worldwide",
  description: "A modern learning management system for instructors and students",
  icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Explicit choice is stored in a cookie so we can set data-theme during SSR —
  // correct on first paint, no flash. When there's no cookie, the theme follows
  // the OS via the prefers-color-scheme rules in globals.css (also flash-free).
  const theme = (await cookies()).get("theme")?.value;
  const dataTheme = theme === "dark" || theme === "light" ? theme : undefined;

  return (
    <html lang="en" data-theme={dataTheme} className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
