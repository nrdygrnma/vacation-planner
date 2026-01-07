export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side to avoid double fetching during SSR if not needed,
  // although it's fine to run once. Nuxt plugins can be client-only.
  if (import.meta.client) {
    try {
      await $fetch("/api/currencies/sync", { method: "POST" });
      console.log("Exchange rates synchronized on start");
    } catch (e) {
      console.error("Failed to sync currencies on start", e);
    }
  }
});
