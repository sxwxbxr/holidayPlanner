import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { NotificationContainer } from "@/components/notifications/notification-container";
import { GradientBackground } from "@/components/animate-ui/components/backgrounds/gradient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holiday Planner",
  description: "Plan your trips and sync plans between multiple people",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GradientBackground className="fixed inset-0 -z-10 opacity-20" />
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
          <NotificationContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
