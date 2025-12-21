import { defineNuxtPlugin } from "#app";
import { NuxtLink } from "#components";

// without this the nuxt-link inside our Component Library is not working
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("NuxtLink", NuxtLink);
});
