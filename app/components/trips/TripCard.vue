<template>
  <article
    class="group card card-compact border shadow-sm hover:shadow-md hover:border-accent-300/30 hover:bg-accent/10 transition-all duration-300 overflow-hidden text-xs cursor-pointer"
    role="region"
    tabindex="0"
    @click.self="handleClick"
    @keyup.enter="handleClick"
  >
    <figure class="relative aspect-[16/9] bg-base-200">
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
      ></div>
      <div class="absolute left-3 top-3 flex items-center gap-2">
        <span class="badge badge-soft badge-primary">{{
          trip.currency?.symbol || "¤"
        }}</span>
      </div>
    </figure>

    <div class="card-body p-3">
      <div class="flex items-start justify-between gap-2">
        <h2 class="font-semibold leading-snug line-clamp-2 text-sm">
          {{ trip.title }}
        </h2>
      </div>

      <p class="text-xs text-base-content/70">
        {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
      </p>

      <div class="mt-1.5 flex items-center justify-between">
        <div
          class="inline-flex items-center gap-1.5 text-xs text-base-content/80"
        >
          <Icon class="size-3.5" name="lucide:users" />
          <span>{{ trip.people }}</span>
        </div>

        <div class="inline-flex items-center gap-1">
          <TripEditModal :trip="trip" @saved="$emit('changed')" />
          <TripDeleteModal :trip="trip" @deleted="$emit('changed')" />
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import TripEditModal from "./TripEditModal.vue";
import TripDeleteModal from "./TripDeleteModal.vue";
import { useDateUtils } from "@/composables/useDateUtils";
import type { Trip } from "@/types/tripTypes";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{
  (e: "open", trip: Trip): void;
  (e: "changed"): void;
}>();

const { formatDate } = useDateUtils();

const defaultImage =
  "https://images.unsplash.com/photo-1749573359174-760bc4090464?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const onImgError = (ev: Event) => {
  const img = ev.target as HTMLImageElement | null;
  if (!img) return;
  if (img.src === defaultImage) return;
  img.src = defaultImage;
};

const handleClick = () => {
  emit("open", props.trip);
};
</script>
