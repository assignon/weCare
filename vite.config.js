import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // Use more permissive patterns that will match files after build
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot,json,webmanifest}",
          "assets/**/*.{js,css,png,svg,woff2}"
        ],
        globIgnores: [
          "**/node_modules/**/*",
          "**/sw.js",
          "**/workbox-*.js",
          "**/firebase-messaging-sw.js",
          "**/registerSW.js"
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
      manifest: {
        name: "shop",
        short_name: "shop",
        description:
          "Your marketplace - Browse, buy, and track orders in one place",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#667eea",
        theme_color: "#7C3AED",
        categories: ["shopping", "lifestyle", "beauty"],
        lang: "en",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Disable CSS code splitting to avoid preload errors
    // All CSS will be bundled into a single file
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Ensure consistent chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Increase chunk size warning limit to avoid warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "shopper.local",
    port: 3000,
    open: true,
    allowedHosts: ["7a643c2e8ed8.ngrok-free.app", "shopper.local:3002"],
    // allowedHosts: true,
    // https: {
    //   key: fs.readFileSync('shopper-key.pem'),
    //   cert: fs.readFileSync('shopper.pem'),
    // },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
});
