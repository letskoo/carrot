import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/carrot-images/**",
      },
      // 기존 remotePatterns 추가 가능
    ],
  },
  /* config options here */
};

export default nextConfig;
