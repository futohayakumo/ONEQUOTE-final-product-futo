import type { Metadata } from "next";
import { LocaleProvider } from "@/components/shell/LocaleProvider";
import { LocalizeScript } from "@/components/shell/LocalizeScript";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteNav } from "@/components/shell/SiteNav";
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
      {/* No horizontal padding here — full-bleed bands must reach the viewport
          edges. Each page owns its own container. */}
      <body className="flex min-h-svh flex-col bg-canvas type-body">
        {/* Six controls sat between every navigation and the page content,
            re-traversed on every route. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:border focus:border-crimson focus:bg-studio focus:px-4 focus:py-2 focus:type-label focus:rounded-card"
        >
          Skip to content
        </a>
        <LocaleProvider>
          <LocalizeScript />
          <SiteNav />
        {/* Clips the route transition's sideways travel. See .app-shell. */}
        <div id="content" className="app-shell flex-1">{children}</div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
