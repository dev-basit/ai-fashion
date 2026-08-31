import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withSerwist(nextConfig);
