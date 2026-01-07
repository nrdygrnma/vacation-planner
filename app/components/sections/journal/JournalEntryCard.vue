<template>
  <div class="relative flex flex-col md:flex-row md:items-start gap-8">
    <!-- Date indicator -->
    <div
      class="md:w-32 flex-shrink-0 flex md:flex-col items-center md:items-end gap-2 text-right"
    >
      <div
        class="size-10 rounded-full bg-primary flex items-center justify-center text-white z-10 md:order-2"
      >
        <UIcon class="size-5" name="i-lucide-calendar" />
      </div>
      <div class="md:order-1">
        <p class="text-sm font-black text-gray-900 leading-none">
          {{ formatDate(entry.date, "MMM dd") }}
        </p>
        <p
          class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          {{ formatDate(entry.date, "yyyy") }}
        </p>
      </div>
    </div>

    <!-- Content Card -->
    <UCard class="flex-1 overflow-hidden" shadow="sm">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div
            class="prose prose-sm prose-primary max-w-none text-gray-600 whitespace-pre-wrap"
          >
            {{ entry.content }}
          </div>
          <div
            class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <UButton
              color="neutral"
              icon="i-lucide-edit"
              size="xs"
              variant="ghost"
              @click="$emit('edit')"
            />
            <UButton
              color="error"
              icon="i-lucide-trash"
              size="xs"
              variant="ghost"
              @click="$emit('delete')"
            />
          </div>
        </div>

        <div
          v-if="entry.photos?.length"
          class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2"
        >
          <div
            v-for="photo in entry.photos"
            :key="photo.id"
            class="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm"
          >
            <img
              :src="photo.url"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              @click="openImage(photo.url)"
            />
            <div
              v-if="photo.caption"
              class="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1.5 text-[10px] text-white truncate"
            >
              {{ photo.caption }}
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Overlay Image View -->
    <UModal v-model:open="isImageOpen" fullscreen>
      <div
        class="h-full w-full flex items-center justify-center bg-black/95 p-4 relative"
        @click="isImageOpen = false"
      >
        <img
          :src="selectedImageUrl"
          class="max-w-full max-h-full object-contain shadow-2xl"
        />
        <UButton
          class="absolute top-4 right-4"
          color="white"
          icon="i-lucide-x"
          size="lg"
          variant="ghost"
          @click="isImageOpen = false"
        />
      </div>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { type JournalEntry } from "@/types/tripTypes";
import { format } from "date-fns";

const props = defineProps<{
  entry: JournalEntry;
}>();

defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const formatDate = (date: string, pattern: string) => {
  try {
    return format(new Date(date), pattern);
  } catch {
    return date;
  }
};

const isImageOpen = ref(false);
const selectedImageUrl = ref("");

const openImage = (url: string) => {
  selectedImageUrl.value = url;
  isImageOpen.value = true;
};
</script>

<style scoped>
/* Hover support for buttons if group class is added to parent */
.relative:hover .opacity-0 {
  opacity: 1;
}
</style>
