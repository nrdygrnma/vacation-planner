<template>
  <header class="space-y-3 pt-1">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="min-w-0">
        <h1
          :title="trip.title"
          class="truncate text-2xl md:text-3xl font-light text-primary leading-[1.2] overflow-visible"
        >
          {{ trip.title }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <div
          class="hidden md:flex items-center gap-4 text-sm text-gray-600 mr-2"
        >
          <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
            <UIcon class="size-4" name="i-lucide-calendar" />
            {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon class="size-4" name="i-lucide-users" />
            {{ trip.people }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon class="size-4" name="i-lucide-banknote" />
            <UBadge color="neutral" size="sm" variant="soft">
              {{ trip.currency?.symbol || "¤" }}
            </UBadge>
          </span>
        </div>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Comparisons"
        >
          <UButton
            color="neutral"
            icon="i-lucide-layers"
            variant="outline"
            @click="emit('show-comparisons')"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            color="neutral"
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
            icon="i-lucide-trash"
            variant="outline"
            @click="emit('delete')"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Mobile/Tablet meta below name -->
    <div
      class="md:hidden flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600"
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
  (e: "show-comparisons"): void;
}>();

const { formatDate } = useDateUtils();
</script>
