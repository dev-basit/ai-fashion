import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkFirst, CacheableResponsePlugin } from "serwist";

declare const self: {
  __SW_MANIFEST: (string | { url: string; revision: string | null })[];
} & typeof globalThis;

const navigationHandler = new NetworkFirst({
  cacheName: "pages-cache",
  networkTimeoutSeconds: 3,
  plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: navigationHandler,
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
