import type { Metadata } from "next";
import { inter, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integrated Portfolio for Enterprise Delivery",
  description:
    "A case study bridging global shipping domains, modern system architecture, and AI-driven delivery workflows.",
  /*
   * A link shared with a few people is not a private link. Chat clients fetch
   * it to build a preview, a click from anywhere else puts it in a Referer
   * header, and browser telemetry has been enough to get unlinked URLs indexed
   * before now. This is the cheapest measure that actually helps, and it costs
   * nothing to keep on permanently.
   */
  robots: { index: false, follow: false, nocache: true },
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
      <body className="min-h-svh bg-canvas type-body">
        {/* Clips the route transition's sideways travel. See .app-shell. */}
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
