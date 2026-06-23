const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*$/i,
      handler: "CacheFirst",
      options: { cacheName: "google-fonts" },
    },
    {
      urlPattern: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-resources" },
    },
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "uicare-runtime",
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@uicare-hui/safety-core"],
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT:
      process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || "mock",
    NEXT_PUBLIC_AZURE_OPENAI_KEY:
      process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY || "mock",
  },
  experimental: {
    typedRoutes: true,
  },
};

module.exports = withPWA(nextConfig);
