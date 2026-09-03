import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // drei's barrel re-exports ~200 components; without this, importing
    // <Edges> alone drags in shader-material chains.
    optimizePackageImports: ["@react-three/drei"],
  },
};

export default nextConfig;
