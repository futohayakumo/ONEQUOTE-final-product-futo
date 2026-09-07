import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /*
   * Static export, opt-in via STATIC_EXPORT=1.
   *
   * Every route here is already prerendered, and the app has no API routes,
   * server actions, dynamic segments, middleware or next/image — so it exports
   * to plain files with nothing left to run. That makes hosting it a matter of
   * serving a directory, and lets Cloudflare Access sit in front of the whole
   * thing without a runtime to work around.
   *
   * It is opt-in so `pnpm build` — which `pnpm verify` runs — keeps exercising
   * the same server build that `pnpm start` serves.
   */
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
  experimental: {
    // drei's barrel re-exports ~200 components; without this, importing
    // <Edges> alone drags in shader-material chains.
    optimizePackageImports: ["@react-three/drei"],
  },
};

export default nextConfig;
