// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

// Resolve path to the browser shim for Prisma's `index-browser` entry.
const prismaBrowserShim = new URL(
  "./app/shims/prisma.browser.ts",
  import.meta.url,
).pathname;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "vue-sonner/nuxt"],
  css: ["~/assets/css/main.css"],
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
