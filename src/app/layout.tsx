import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "SkillPilot — Learn something new",
  description: "Find a course, build a skill, and keep moving forward.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${dmSans.variable} ${newsreader.variable}`} lang="en">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
