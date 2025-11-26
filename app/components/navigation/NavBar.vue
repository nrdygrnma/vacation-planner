<template>
  <nav class="navbar shadow-sm shadow-base-300/20 px-6 py-0 rounded-sm">
    <div class="w-full flex items-center justify-between">
      <NuxtLink
        class="text-lg font-semibold uppercase no-underline text-base-content whitespace-nowrap"
        to="/"
      >
        <img
          alt="Tripé Vacation Planner"
          class="pt-1 h-6 w-auto"
          src="/images/tripe_logo.png"
        />
      </NuxtLink>

      <!-- Tabs -->
      <div class="hidden md:flex items-center gap-2">
        <TabLink to="/">Trips</TabLink>
        <TabLink to="/flights">Flights</TabLink>
        <TabLink to="/car-rentals">Car Rentals</TabLink>
        <TabLink to="/accommodations">Accommodations</TabLink>
        <TabLink to="/map">Map</TabLink>
      </div>

      <!-- Mobile toggle -->
      <div class="md:hidden">
        <button
          class="btn btn-outline btn-secondary btn-sm btn-square p-1"
          type="button"
          @click="isOpen = !isOpen"
        >
          <Icon v-if="!isOpen" name="lucide:menu" size="24" />
          <Icon v-else name="lucide:x" size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Tabs -->
    <div v-if="isOpen" class="flex flex-col gap-1 mt-1 md:hidden">
      <TabLink to="/">Trips</TabLink>
      <TabLink to="/flights">Flights</TabLink>
      <TabLink to="/car-rentals">Car Rentals</TabLink>
      <TabLink to="/accommodations">Accommodations</TabLink>
      <TabLink to="/map">Map</TabLink>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import TabLink from "./TabLink.vue";

const isOpen = ref(false);
</script>

<style scoped>
.navbar {
  min-height: 3rem;
}

.tabs .tab {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
</style>
