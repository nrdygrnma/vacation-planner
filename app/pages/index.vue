<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-3xl text-primary font-light">Trip Overview</h1>
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          aria-label="Search trips"
          class="input input-sm w-40 sm:w-64"
          placeholder="Search trips"
          type="search"
          @keydown.esc="search = ''"
        />
        <TripCreateModal @saved="refresh()" />
      </div>
    </div>

    <div
      v-if="filteredTrips.length"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="trip in filteredTrips"
        :key="trip.id"
        class="group card card-compact border shadow-sm hover:shadow-md hover:border-accent-300/30 hover:bg-accent/10 transition-all duration-300 overflow-hidden text-xs cursor-pointer"
        role="region"
        tabindex="0"
        @click="onCardClick(trip)"
        @keyup.enter="onCardClick(trip)"
      >
        <figure class="relative aspect-[16/9] bg-base-200">
          <img
            :src="trip.imageUrl || defaultImage"
            alt="Trip cover"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            decoding="async"
            loading="lazy"
            @error="onImgError($event)"
          />
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
          ></div>
          <div class="absolute left-3 top-3 flex items-center gap-2">
            <span class="badge badge-soft badge-primary">
              {{ trip.currency?.symbol || "¤" }}
            </span>
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

            <div class="inline-flex items-center gap-1" @click.stop>
              <TripEditModal :trip="trip" @saved="refresh()" />
              <TripDeleteModal :trip="trip" @deleted="refresh()" />
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="text-base-content/60 italic">
      <span v-if="(trips?.length || 0) === 0"
        >No trips yet. Create your first trip.</span
      >
      <span v-else>No trips match your search.</span>
    </div>
  </section>
</template>

<script lang="ts" setup>
import TripCreateModal from "@/components/trip/TripCreateModal.vue";
import TripEditModal from "@/components/trip/TripEditModal.vue";
import TripDeleteModal from "@/components/trip/TripDeleteModal.vue";
import { useDateUtils } from "@/composables/useDateUtils";
import type { Trip } from "@/types/tripTypes";

const { formatDate } = useDateUtils();

const { data: trips, refresh } = await useFetch("/api/trips", { key: "trips" });

const search = ref("");
const filteredTrips = computed<Trip[]>(() => {
  const list = trips?.value ?? [];
  const q = search.value.trim().toLowerCase();
  if (!q) return list as Trip[];
  return (list as Trip[]).filter((t) => t.title.toLowerCase().includes(q));
});

const defaultImage =
  "https://images.unsplash.com/photo-1749573359174-760bc4090464?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const onImgError = (ev: Event) => {
  const img = ev.target as HTMLImageElement | null;
  if (!img) return;
  if (img.src === defaultImage) return;
  img.src = defaultImage;
};

const onCardClick = (trip: Trip) => {
  // Placeholder for future navigation to trip details page
  // Will be replaced with navigateTo(`/trips/${trip.id}`) later
  // For now we keep the handler to avoid unused listener warnings
  console.debug("Card clicked:", trip.id);
};
</script>
