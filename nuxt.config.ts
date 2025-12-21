// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

// Resolve path to the browser shim for Prisma's `index-browser` entry.
const prismaBrowserShim = new URL(
  "./app/shims/prisma.browser.ts",
  import.meta.url,
).pathname;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  // Force light mode by default so the UI doesn't appear dark when the OS is in dark mode
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },
  modules: [
    "@nuxt/icon",
    "vue-sonner/nuxt",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@nuxt/ui",
  ],
  icon: {
    serverBundle: {
      collections: ["lucide"],
    },
  },
  css: ["~/assets/css/main.css"],
  plugins: ["~/plugins/fix-nuxt-link.ts"],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // In the browser, Prisma resolves to its `index-browser` entry.
        // Alias that specific path to a safe shim that exports placeholders.
        // This avoids Vite trying to load real Prisma in the client.
        "@prisma/client/index-browser": prismaBrowserShim,
      },
    },
    optimizeDeps: {
      exclude: ["@prisma/client", "prisma"],
    },
    ssr: {
      // Ensure Prisma remains externalized for SSR build.
      external: ["@prisma/client", "prisma"],
    },
  },
  vueSonner: {
    css: true,
  },
});
