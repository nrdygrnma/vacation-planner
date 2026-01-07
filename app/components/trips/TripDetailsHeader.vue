<template>
  <header :class="['space-y-0.5 pt-0.5', isOverlay ? 'text-white' : '']">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="min-w-0 px-4">
        <h1
          :class="[
            'truncate text-3xl md:text-4xl font-light leading-tight overflow-visible',
            isOverlay ? 'text-white' : 'text-primary',
          ]"
          :title="trip.title"
        >
          {{ trip.title }}
        </h1>
      </div>

      <div class="flex items-center gap-2 px-4">
        <div
          :class="[
            'hidden md:flex items-center gap-4 text-sm mr-2',
            isOverlay ? 'text-white/90' : 'text-gray-600',
          ]"
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
            <UTooltip
              :content="{ align: 'center', side: 'top', sideOffset: 8 }"
              :text="`${trip.currency!.name}`"
              arrow
            >
              <UBadge
                class="cursor-help bg-white/10 text-white/90"
                color="neutral"
                size="sm"
                variant="soft"
              >
                {{ trip.currency?.symbol || "¤" }}
              </UBadge>
            </UTooltip>
          </span>
        </div>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Comparisons"
        >
          <UButton
            class="bg-white/10 hover:bg-white/20 text-white/90 hover:text-white/95"
            color="neutral"
            icon="i-lucide-layers"
            variant="soft"
            @click="emit('show-comparisons')"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            class="bg-white/10 hover:bg-white/20 text-white/90 hover:text-white/95"
            icon="i-lucide-edit"
            variant="soft"
            @click="emit('edit')"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Delete"
        >
          <UButton
            class="backdrop-blur-sm"
            color="error"
            icon="i-lucide-trash"
            variant="subtle"
            @click="emit('delete')"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Mobile/Tablet meta below name -->
    <div
      :class="[
        'md:hidden flex flex-wrap items-center gap-x-4 gap-y-1 text-sm px-4',
        isOverlay ? 'text-white/90' : 'text-gray-600',
      ]"
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
        <UBadge :color="isOverlay ? 'neutral' : 'neutral'" variant="soft">
          {{ trip.currency?.symbol || "¤" }}
        </UBadge>
      </span>
    </div>
  </header>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";
import { useDateUtils } from "@/composables/useDateUtils";

const props = defineProps<{
  trip: Trip;
  isOverlay?: boolean;
}>();
const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
  (e: "show-comparisons"): void;
}>();

const { formatDate } = useDateUtils();
</script>
