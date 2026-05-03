import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sooriya Chess Academy | Premium Chess Coaching for Kids",
    template: "%s | Sooriya Chess Academy",
  },
  description:
    "Premium chess coaching in Chennai and online for kids, beginners, tournament players, and students ready to think five moves ahead. Book a free demo class.",
  keywords: [
    "Sooriya Chess Academy",
    "chess coaching Chennai",
    "kids chess classes",
    "online chess coaching",
    "tournament chess training",
    "free chess demo class",
  ],
  openGraph: {
    title: "Sooriya Chess Academy",
    description:
      "Structured chess coaching for young learners, serious competitors, and tournament-ready students.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070604",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
