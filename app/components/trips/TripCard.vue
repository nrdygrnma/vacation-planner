<template>
  <UCard
    :ui="{
      root: '',
      header: '!p-0 sm:!p-0 md:!p-0 lg:!p-0',
      footer: '!px-4 sm:!px-4 sm:!py-2',
      body: 'p-4 sm:!p-4',
    }"
    class="group cursor-pointer transition-all duration-300 hover:shadow-md p-0 [&>[data-slot=header]]:!p-0 [&>[data-slot=header]]:sm:!p-0"
    role="region"
    tabindex="0"
    @click="handleClick"
    @keyup.enter="handleEnter"
  >
    <template #header>
      <div
        class="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800 p-0"
      >
        <img
          :src="trip.imageUrl || defaultImage"
          alt="Trip cover"
          class="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          decoding="async"
          loading="lazy"
          @error="onImgError"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
        />
        <div class="absolute left-3 top-3 flex items-center gap-2">
          <UBadge color="neutral" variant="soft">
            {{ trip.currency?.symbol || "¤" }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="flex items-start justify-between gap-2">
      <h2
        class="text-sm text-primary-500 font-semibold leading-snug line-clamp-2"
      >
        {{ trip.title }}
      </h2>
    </div>

    <p class="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
      {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
    </p>

    <div class="mt-2 flex items-center justify-between">
      <div
        class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"
      >
        <Icon class="size-4" name="lucide:users" />
        <span>{{ trip.people }}</span>
      </div>
    </div>

    <template #footer>
      <div
        class="flex items-center gap-1 justify-end relative z-10 overflow-visible"
      >
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            icon="lucide:edit"
            variant="outline"
            @click="emit('edit', trip)"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Delete"
        >
          <UButton
            color="error"
            icon="lucide:trash"
            variant="outline"
            @click="emit('delete', trip)"
          />
        </UTooltip>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { useDateUtils } from "@/composables/useDateUtils";
import type { Trip } from "@/types/tripTypes";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{
  (e: "open", trip: Trip): void;
  (e: "changed"): void;
  (e: "delete", trip: Trip): void;
  (e: "edit", trip: Trip): void;
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

const isInteractiveTarget = (el: HTMLElement | null): boolean => {
  if (!el) return false;
  return !!el.closest(
    'button, a, input, textarea, select, [role="button"], [data-command]',
  );
};

const handleClick = (ev: MouseEvent) => {
  const target = ev.target as HTMLElement | null;
  if (isInteractiveTarget(target)) {
    return;
  }
  emit("open", props.trip);
};

const handleEnter = () => {
  emit("open", props.trip);
};
</script>
