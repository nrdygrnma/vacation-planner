<script lang="ts" setup>
import type { AccommodationImage } from "~/types/tripTypes";

const props = defineProps<{
  images: AccommodationImage[];
}>();

const currentIndex = ref(0);

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prev = () => {
  currentIndex.value =
    (currentIndex.value - 1 + props.images.length) % props.images.length;
};
</script>

<template>
  <div class="relative group/carousel w-full h-40 overflow-hidden bg-gray-100">
    <TransitionGroup class="relative w-full h-full" name="fade" tag="div">
      <div
        v-for="(image, index) in images"
        v-show="index === currentIndex"
        :key="image.id"
        class="absolute inset-0"
      >
        <img
          :src="image.url"
          alt="Accommodation"
          class="w-full h-full object-cover"
        />
      </div>
    </TransitionGroup>

    <!-- Navigation Arrows -->
    <template v-if="images.length > 1">
      <button
        class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        @click.stop="prev"
      >
        <UIcon class="size-4" name="i-lucide-chevron-left" />
      </button>
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        @click.stop="next"
      >
        <UIcon class="size-4" name="i-lucide-chevron-right" />
      </button>

      <!-- Indicators -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        <div
          v-for="(_, index) in images"
          :key="index"
          :class="index === currentIndex ? 'bg-white w-3' : 'bg-white/50'"
          class="size-1.5 rounded-full transition-all"
        />
      </div>

      <!-- Counter -->
      <div
        class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded font-bold"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
