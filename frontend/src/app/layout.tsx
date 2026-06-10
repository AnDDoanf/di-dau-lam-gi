import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { execSync } from "child_process";
import path from "path";
import { LanguageProvider } from "@/context/LanguageContext";
import { PlacesProvider } from "@/context/PlacesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Đi Đâu Ăn Gì? - Food Tour Map",
  description: "Vietnamese Food Tour Planner & Experience Mapper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Automatically trigger parse-places compilation script on every server rendering cycle
  if (typeof window === "undefined") {
    try {
      const scriptPath = path.resolve(process.cwd(), "scripts/parse-places.js");
      execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    } catch (err) {
      console.error("Error running parse-places.js in layout:", err);
    }
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <PlacesProvider>{children}</PlacesProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
