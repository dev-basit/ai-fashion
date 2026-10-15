import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Serwist injects a webpack config, which makes Turbopack (the Next.js 16
  // default for `next dev`) error unless a turbopack config is also present.
  // An empty object silences that error; the service worker is still built via
  // the `--webpack` flag in the `build` script (serwist is disabled in dev).
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withSerwist(nextConfig);
