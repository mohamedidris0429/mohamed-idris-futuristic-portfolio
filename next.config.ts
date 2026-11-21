import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Portfoli.html redirect removed - Next.js app router handles /
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;
