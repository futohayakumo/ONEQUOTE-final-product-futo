import type { Metadata } from "next";
import { inter, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integrated Portfolio for Enterprise Delivery",
  description:
    "A case study bridging global shipping domains, modern system architecture, and AI-driven delivery workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      {/* No horizontal padding here — the persona gateway must reach the
          viewport edges. Each page owns its own container. */}
      <body className="min-h-svh bg-canvas type-body">{children}</body>
    </html>
  );
}
