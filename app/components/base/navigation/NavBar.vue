<template>
  <header class="px-6 py-4 pb-3 border border-gray-100 rounded-md shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <NuxtLink
        aria-label="Tripé Vacation Planner home"
        class="inline-flex items-center gap-2 no-underline"
        to="/"
      >
        <img
          alt="Tripé Vacation Planner"
          class="h-6 w-auto"
          src="/images/tripe_logo.png"
        />
      </NuxtLink>

      <!-- Desktop navigation using custom TabLink -->
      <nav class="hidden md:flex items-center gap-8">
        <TabLink v-for="item in links" :key="item.to" :to="item.to">{{
          item.label
        }}</TabLink>
      </nav>

      <!-- Mobile toggle -->
      <div class="md:hidden">
        <UButton
          v-if="!isOpen"
          :aria-label="isOpen ? 'Close menu' : 'Open menu'"
          color="neutral"
          icon="i-lucide-menu"
          variant="ghost"
          @click="isOpen = !isOpen"
        />
        <UButton
          v-else
          aria-label="Close menu"
          color="neutral"
          icon="i-lucide-x"
          variant="ghost"
          @click="isOpen = false"
        />
      </div>
    </div>

    <!-- Mobile navigation using custom TabLink -->
    <div v-if="isOpen" class="mt-2 md:hidden">
      <nav class="flex flex-col gap-2" @click="isOpen = false">
        <TabLink v-for="item in links" :key="item.to" :to="item.to">{{
          item.label
        }}</TabLink>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
import TabLink from "~/components/base/navigation/TabLink.vue";

const links = [
  { label: "Trips", to: "/" },
  { label: "Currencies", to: "/currencies" },
  { label: "Docs", to: "/docs" },
];

const isOpen = ref(false);
</script>

<style scoped>
header {
  min-height: 3rem;
}
</style>
