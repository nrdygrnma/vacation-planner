<template>
  <div class="group relative">
    <div class="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
      <!-- Date indicator -->
      <div
        class="flex flex-row md:flex-col items-center md:items-start gap-4 md:w-28 shrink-0"
      >
        <div
          class="size-10 rounded-full bg-primary flex items-center justify-center text-white z-10 shrink-0 shadow-sm"
        >
          <UIcon class="size-5" name="i-lucide-calendar" />
        </div>
        <div class="flex flex-col md:items-start">
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
      <div
        class="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 mb-2"
      >
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <div
                class="text-gray-600 text-sm whitespace-pre-wrap break-words"
              >
                {{ entry.content }}
              </div>
            </div>
            <div
              class="flex gap-1 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity"
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
                class="size-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                @click="openImage(photo)"
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
      </div>
    </div>

    <!-- Overlay Image View -->
    <UModal
      v-model:open="isImageOpen"
      :close="false"
      :ui="{
        content: 'bg-black/95 border-none shadow-none',
        header: 'hidden',
        body: 'p-0 h-full',
      }"
      fullscreen
    >
      <template #title>
        <div class="sr-only">Image Preview</div>
      </template>
      <template #description>
        <div class="sr-only">Full screen image preview</div>
      </template>
      <template #body>
        <div
          class="h-full w-full flex flex-col items-center justify-center p-4 md:p-12 relative"
          @click="isImageOpen = false"
        >
          <!-- Navigation Arrows -->
          <template v-if="entry.photos.length > 1">
            <UButton
              class="absolute left-4 md:left-8 z-20 text-white/50 hover:text-white"
              color="neutral"
              icon="i-lucide-chevron-left"
              size="xl"
              variant="ghost"
              @click.stop="prevImage"
            />
            <UButton
              class="absolute right-4 md:right-8 z-20 text-white/50 hover:text-white"
              color="neutral"
              icon="i-lucide-chevron-right"
              size="xl"
              variant="ghost"
              @click.stop="nextImage"
            />
          </template>

          <!-- Image -->
          <div
            class="relative flex-1 flex items-center justify-center min-h-0 w-full"
          >
            <img
              :key="currentPhoto?.id"
              :src="currentPhoto?.url"
              class="max-w-full max-h-full object-contain shadow-2xl rounded-sm transition-opacity duration-300"
              @click.stop
            />

            <!-- Close Button Inside -->
            <UButton
              class="absolute top-0 right-0 md:-top-8 md:-right-8 z-20"
              color="neutral"
              icon="i-lucide-x"
              size="lg"
              variant="ghost"
              @click="isImageOpen = false"
            />
          </div>

          <!-- Caption -->
          <div
            v-if="currentPhoto?.caption"
            class="mt-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white text-sm font-medium max-w-(--breakpoint-md) text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
            @click.stop
          >
            {{ currentPhoto.caption }}
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { type JournalEntry, type JournalPhoto } from "@/types/tripTypes";
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
const currentPhotoIndex = ref(0);

const currentPhoto = computed(() => {
  if (!props.entry.photos || props.entry.photos.length === 0) return null;
  return props.entry.photos[currentPhotoIndex.value];
});

const openImage = (photo: JournalPhoto) => {
  const index = props.entry.photos.findIndex((p) => p.id === photo.id);
  if (index !== -1) {
    currentPhotoIndex.value = index;
    isImageOpen.value = true;
  }
};

const nextImage = () => {
  if (!props.entry.photos.length) return;
  currentPhotoIndex.value =
    (currentPhotoIndex.value + 1) % props.entry.photos.length;
};

const prevImage = () => {
  if (!props.entry.photos.length) return;
  currentPhotoIndex.value =
    (currentPhotoIndex.value - 1 + props.entry.photos.length) %
    props.entry.photos.length;
};
</script>

<style scoped></style>
