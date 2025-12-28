<template>
  <header class="space-y-2">
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div class="min-w-0">
        <h1
          :title="trip.title"
          class="min-w-0 whitespace-nowrap overflow-x-hidden text-ellipsis text-2xl md:text-3xl leading-normal font-light text-primary"
        >
          {{ trip.title }}
        </h1>
      </div>

      <div
        class="hidden sm:flex min-w-0 items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600"
      >
        <span class="inline-flex items-center gap-1.5">
          <UIcon class="size-4" name="i-lucide-calendar" />
          {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
        </span>
        <span aria-hidden="true" class="text-gray-300">•</span>
        <span class="inline-flex items-center gap-1.5">
          <UIcon class="size-4" name="i-lucide-users" />
          {{ trip.people }}
        </span>
        <span aria-hidden="true" class="text-gray-300">•</span>
        <span class="inline-flex items-center gap-1.5">
          <UIcon class="size-4" name="i-lucide-banknote" />
          <UBadge color="neutral" variant="soft">
            {{ trip.currency?.symbol || "¤" }}
          </UBadge>
        </span>
      </div>

      <div class="flex items-center justify-end gap-2">
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            icon="i-lucide-edit"
            variant="outline"
            @click="emit('edit')"
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
            @click="emit('delete')"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Mobile meta below title when < sm -->
    <div
      class="sm:hidden flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600"
    >
      <span class="inline-flex items-center gap-1.5">
        <UIcon class="size-4" name="i-lucide-calendar" />
        {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon class="size-4" name="i-lucide-users" />
        {{ trip.people }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon class="size-4" name="i-lucide-banknote" />
        <UBadge color="neutral" variant="soft">
          {{ trip.currency?.symbol || "¤" }}
        </UBadge>
      </span>
    </div>
  </header>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";
import { useDateUtils } from "@/composables/useDateUtils";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const { formatDate } = useDateUtils();
</script>
