import type { NextConfig } from "next";

// Proxy /api/* through Vercel to the FastAPI backend so the refresh
// cookie stays first-party. Without this, modern browsers (Safari ITP,
// Firefox TCP, Chrome's 3p cookie phase-out) silently drop the
// cross-site refresh cookie on reload and the user gets kicked to
// /login. BACKEND_INTERNAL_URL is server-side (no NEXT_PUBLIC_ prefix)
// so it never ships in the browser bundle.
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ?? "https://stock-sense-hy9z.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
