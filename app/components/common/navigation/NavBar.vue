<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 px-6 pt-2 pb-1">
    <div class="flex items-center justify-between h-10 gap-4">
      <!-- Logo -->
      <NuxtLink class="flex items-center gap-2" to="/">
        <img
          alt="Tripé Vacation Planner"
          class="h-6 w-auto"
          src="/images/tripe_logo.png"
        />
      </NuxtLink>

      <!-- Desktop Tabs (right aligned) -->
      <div class="hidden md:flex flex-1 justify-end">
        <UTabs
          :items="tabs"
          :model-value="activeValue"
          :ui="tabsUi"
          size="sm"
          variant="link"
          @update:model-value="onTabChange"
        />
      </div>

      <!-- Mobile button -->
      <UButton
        :trailing-icon="isOpen ? 'lucide:x' : 'lucide:menu'"
        class="md:hidden"
        color="neutral"
        size="md"
        type="button"
        variant="outline"
        @click="isOpen = !isOpen"
      />
    </div>

    <!-- Mobile menu -->
    <div v-if="isOpen" class="md:hidden mt-2">
      <div class="flex flex-col gap-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.value"
          :class="
            route.path === tab.value
              ? 'text-primary border-b border-primary'
              : 'text-gray-500 dark:text-gray-300'
          "
          :to="tab.value"
          class="px-3 py-2 text-sm font-semibold rounded hover:bg-gray-50 dark:hover:bg-gray-900"
          @click="isOpen = false"
        >
          {{ tab.label }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from "vue-router";
import {computed, ref} from "vue";
import type {TabsItem} from "@nuxt/ui";

const route = useRoute();
const router = useRouter();
const isOpen = ref(false);

const tabs = [
  { label: "Trips", value: "/" },
  { label: "Flights", value: "/flights" },
  { label: "Car Rentals", value: "/car-rentals" },
  { label: "Accommodations", value: "/accommodations" },
  { label: "Map", value: "/map" },
] satisfies TabsItem[];

const activeValue = computed<string | number>(() => route.path);

const tabsUi = {
  wrapper: "w-auto",
  list: ["flex gap-4", "w-auto mt-2", "border-b border-transparent"].join(" "),
  trigger: [
    "relative pb-2 text-sm font-semibold",
    "cursor-pointer",
    "text-gray-500 hover:text-gray-900",
    "dark:text-gray-300 dark:hover:text-white",
    "data-[selected=true]:text-primary",
  ].join(" "),
  indicator: "absolute inset-x-0 -bottom-[4px] h-0.5 bg-primary rounded-full",
};

const onTabChange = (value: string | number) => {
  if (typeof value === "string" && value !== route.path) {
    router.push(value);
  }
};
</script>
