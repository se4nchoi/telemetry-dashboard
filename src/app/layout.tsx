import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { TelemetryProvider } from "@/context/TelemetryContext";
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
  title: "BioStream // Biotech Telemetry Dashboard",
  description: "High-performance real-time telemetry instrumentation dashboard simulating medical bioreactor and MCU streams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary transition-colors duration-200">
        <ThemeProvider>
          <TelemetryProvider>
            {children}
          </TelemetryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
