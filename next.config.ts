import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/Night.mp4",
        destination: "/videos/Night.mp4",
      },
      {
        source: "/Day.mp4",
        destination: "/videos/Day.mp4",
      },
    ];
  },
};

export default nextConfig;
