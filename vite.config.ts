import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Companion PWA for Proink OS. Pure static build - no backend of its own,
// deployed to GitHub Pages, talking directly to a device on the local
// network (see the device-side CORS allow-list in proink-os's
// WebFileServer.cpp, which only allows this app's Pages origin plus
// localhost for dev).
export default defineConfig({
  base: "/proink-companion/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Every /api/* request is live per-device state, never something to
      // cache - only the static app shell (JS/CSS/fonts/icons) is
      // precached, and workbox's default navigateFallback only applies to
      // same-origin navigations anyway, so device requests are untouched.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
      manifest: {
        name: "Proink Companion",
        short_name: "Proink",
        description: "Manage your Proink e-reader over local WiFi: files, settings, catalogs, and EPUB prep.",
        start_url: "/proink-companion/",
        scope: "/proink-companion/",
        display: "standalone",
        background_color: "#f4f3f0",
        theme_color: "#f4f3f0",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
