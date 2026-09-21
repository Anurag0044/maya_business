import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/Night.mp4",
        destination: "/videos/NIGHT_1080p.mp4",
      },
      {
        source: "/Day.mp4",
        destination: "/videos/DAY_1080p.mp4",
      },
    ];
  },
};

export default nextConfig;
