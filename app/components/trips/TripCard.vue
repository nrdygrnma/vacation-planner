<template>
  <UCard
    :ui="cardUi"
    as="article"
    class="group cursor-pointer select-none"
    role="region"
    tabindex="0"
    @click="handleClick"
    @keyup.enter="handleEnter"
  >
    <!-- COVER IMAGE -->
    <template #header>
      <figure
        class="relative aspect-[16/9] bg-gray-100 dark:bg-gray-900 overflow-hidden"
      >
        <img
          :src="trip.imageUrl || defaultImage"
          alt="Trip cover"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          decoding="async"
          loading="lazy"
          @error="onImgError"
        />

        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
        />

        <div class="absolute left-3 top-3 flex items-center gap-2">
          <UBadge color="primary" variant="soft">
            {{ trip.currency?.symbol || "¤" }}
          </UBadge>
        </div>
      </figure>
    </template>

    <!-- BODY -->
    <div class="space-y-1.5">
      <div class="flex items-start justify-between gap-2">
        <h2
          class="font-semibold leading-snug line-clamp-2 text-sm text-gray-900 dark:text-gray-50"
        >
          {{ trip.title }}
        </h2>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
      </p>
    </div>

    <!-- FOOTER -->
    <template #footer>
      <div class="mt-1.5 flex items-center justify-between">
        <div
          class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"
        >
          <Icon class="h-3.5 w-3.5" name="lucide:users" />
          <span>{{ trip.people }}</span>
        </div>

        <div class="inline-flex items-center gap-1">
          <TripEditModal :trip="trip" @saved="$emit('changed')" />
          <TripDeleteModal :trip="trip" @deleted="$emit('changed')" />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import TripEditModal from "./TripEditModal.vue";
import TripDeleteModal from "./TripDeleteModal.vue";
import {useDateUtils} from "@/composables/useDateUtils";
import type {Trip} from "@/types/tripTypes";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{
  (e: "open", trip: Trip): void;
  (e: "changed"): void;
}>();

const { formatDate } = useDateUtils();

const defaultImage =
  "https://images.unsplash.com/photo-1749573359174-760bc4090464?q=80&w=1469&auto=format&fit=crop";

const onImgError = (ev: Event) => {
  const img = ev.target as HTMLImageElement | null;
  if (!img) return;
  if (img.src === defaultImage) return;
  img.src = defaultImage;
};

const isInteractiveTarget = (el: HTMLElement | null): boolean => {
  if (!el) return false;
  return !!el.closest("button, a, input, textarea, select, [role='button']");
};

const handleClick = (ev: MouseEvent) => {
  const target = ev.target as HTMLElement | null;
  if (isInteractiveTarget(target)) return;
  emit("open", props.trip);
};

const handleEnter = () => {
  emit("open", props.trip);
};

const cardUi = {
  root: [
    "rounded-xl overflow-hidden",
    "border border-gray-200 dark:border-gray-800",
    "bg-background shadow-sm",
    "hover:shadow-md hover:border-primary/40 hover:bg-primary/5",
    "transition-all duration-200",
  ].join(" "),
  header: "p-0 sm:p-0",
  body: "p-3 sm:p-3",
  footer: "px-3 pb-3 pt-0",
};
</script>
