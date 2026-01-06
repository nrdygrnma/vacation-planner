<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-map-pin" /> Itinerary
      </h3>
      <UButton color="primary" size="sm" @click="openAdd">
        <UIcon class="size-4" name="i-lucide-plus" />
        <span class="ms-1">Add stop</span>
      </UButton>
    </div>

    <div v-if="pending && !stops.length" class="text-sm text-muted">
      Loading…
    </div>
    <div
      v-else-if="!stops.length && !pending"
      class="text-sm italic text-muted"
    >
      No stops planned yet. Start building your itinerary.
    </div>

    <div v-else class="relative pl-6 space-y-3">
      <!-- Loading overlay for refresh -->
      <div
        v-if="pending"
        class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-lg"
      >
        <UIcon
          class="size-6 animate-spin text-primary-500"
          name="i-lucide-loader-2"
        />
      </div>
      <!-- Vertical line -->
      <div class="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200"></div>

      <draggable
        :list="stopsList"
        class="space-y-3"
        handle=".drag-handle"
        item-key="id"
        @change="onDragChange"
      >
        <template #item="{ element: stop, index: idx }">
          <div class="relative">
            <!-- Dot on the line -->
            <div
              :class="stop.type === 'HUB' ? 'bg-primary-600' : 'bg-primary-500'"
              class="absolute -left-[19px] top-6 size-2.5 rounded-full border-2 border-white z-10"
            ></div>

            <TripStopCard
              :is-expanded="expandedStopId === stop.id"
              :stop="stop"
              @delete="onDelete"
              @edit="onEdit"
              @refresh="onStopRefresh"
              @toggle-expand="toggleStopExpand(stop.id)"
            />

            <!-- Gap indicator between stops -->
            <div
              v-if="
                idx < stopsList.length - 1 && hasGap(stop, stopsList[idx + 1])
              "
              class="my-1 py-0.5 px-2 bg-orange-50 rounded border border-orange-100 text-[10px] text-orange-600 font-medium inline-block ml-2"
            >
              <UIcon class="size-3 mr-1" name="i-lucide-clock" />
              {{ gapDuration(stop, stopsList[idx + 1]) }} unplanned
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <CrudModal
      v-model:open="aeOpen"
      :description="
        aeMode === 'add'
          ? 'Add a new destination to your itinerary'
          : 'Update stop details'
      "
      :submit-label="aeMode === 'add' ? 'Add stop' : 'Save changes'"
      :title="aeMode === 'add' ? 'Add Trip Stop' : 'Edit Trip Stop'"
      @cancel="aeOpen = false"
      @submit="onModalSubmit"
    >
      <TripStopFormNuxt
        :key="aeMode + (aeInitial?.id || '')"
        ref="formRef"
        :initial-values="aeInitial"
        @cancel="aeOpen = false"
        @submit="save"
      />
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      description="This will also remove any accommodation selections for this stop."
      title="Delete trip stop?"
      @cancel="isDeleteOpen = false"
      @confirm="confirmDelete"
    />

    <DateConflictModal
      v-model:open="isConflictOpen"
      @resolve="handleConflictResolve"
    />
  </div>
</template>

<script lang="ts" setup>
import draggable from "vuedraggable";
import TripStopCard from "~/components/tripStops/TripStopCard.vue";
import TripStopFormNuxt from "~/components/tripStops/TripStopFormNuxt.vue";
import DateConflictModal from "~/components/tripStops/DateConflictModal.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { useTripStopsStore } from "~/stores/tripStops";
import type { Trip, TripStop } from "~/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const stopsStore = useTripStopsStore();

const stops = computed(() => stopsStore.byTrip[props.trip.id]?.items ?? []);
const pending = computed(
  () => stopsStore.byTrip[props.trip.id]?.pending ?? false,
);

const stopsList = ref<TripStop[]>([]);
watch(
  stops,
  (newVal) => {
    stopsList.value = [...newVal];
  },
  { immediate: true },
);

const isConflictOpen = ref(false);

const onStopRefresh = () => {
  stopsStore.fetchByTrip(props.trip.id);
  emit("refresh");
};

const onDragChange = async () => {
  // Check for chronological conflicts
  let hasConflict = false;
  for (let i = 1; i < stopsList.value.length; i++) {
    const prev = stopsList.value[i - 1];
    const curr = stopsList.value[i];
    if (new Date(curr.startDate) < new Date(prev.endDate)) {
      hasConflict = true;
      break;
    }
  }

  if (hasConflict) {
    isConflictOpen.value = true;
  } else {
    // No conflict, just update order
    await applyOrderUpdate();
  }
};

const handleConflictResolve = async (action: "shift" | "keep" | "cancel") => {
  if (action === "cancel") {
    stopsList.value = [...stops.value];
    return;
  }

  if (action === "keep") {
    await applyOrderUpdate();
    return;
  }

  if (action === "shift") {
    await applyDateShiftUpdate();
  }
};

const applyOrderUpdate = async () => {
  const orders = stopsList.value.map((s, i) => ({ id: s.id, order: i }));
  try {
    await stopsStore.reorder(props.trip.id, orders);
    toast.success("Order updated");
    emit("refresh");
  } catch (e) {
    toast.error("Failed to update order");
    stopsList.value = [...stops.value];
  }
};

const applyDateShiftUpdate = async () => {
  const updatedStops: any[] = [];
  let currentRefDate = new Date(stopsList.value[0].startDate);

  for (let i = 0; i < stopsList.value.length; i++) {
    const stop = stopsList.value[i];
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    const duration = end.getTime() - start.getTime();

    // If current stop starts before the reference date (previous stop's end), shift it
    if (start < currentRefDate) {
      const newStart = new Date(currentRefDate);
      const newEnd = new Date(newStart.getTime() + duration);

      updatedStops.push({
        id: stop.id,
        order: i,
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
      });
      currentRefDate = newEnd;
    } else {
      // No shift needed for this stop, but update its order
      updatedStops.push({
        id: stop.id,
        order: i,
        startDate: stop.startDate,
        endDate: stop.endDate,
      });
      currentRefDate = end;
    }
  }

  try {
    await stopsStore.batchUpdate(props.trip.id, updatedStops);
    toast.success("Order and dates updated");
    emit("refresh");
  } catch (e) {
    toast.error("Failed to update itinerary");
    stopsList.value = [...stops.value];
  }
};

const expandedStopId = ref<string | null>(null);

const toggleStopExpand = (stopId: string) => {
  if (expandedStopId.value === stopId) {
    expandedStopId.value = null;
  } else {
    expandedStopId.value = stopId;
  }
};

onMounted(() => {
  stopsStore.fetchByTrip(props.trip.id);
});

// Add/Edit
const aeOpen = ref(false);
const aeMode = ref<"add" | "edit">("add");
const aeInitial = ref<any>(null);
const formRef = ref<any>(null);

const openAdd = () => {
  aeMode.value = "add";

  // Suggest start date based on last stop
  let suggestedStart = props.trip.startDate;
  if (stops.value.length > 0) {
    suggestedStart = stops.value[stops.value.length - 1].endDate;
  }

  aeInitial.value = {
    startDate: suggestedStart,
    endDate: suggestedStart, // Default to same day for 0 nights
  };
  aeOpen.value = true;
};

const onEdit = (stop: TripStop) => {
  aeMode.value = "edit";
  aeInitial.value = { ...stop };
  aeOpen.value = true;
};

const onModalSubmit = () => {
  formRef.value?.submit?.();
};

const save = async (payload: any) => {
  try {
    if (aeMode.value === "edit" && aeInitial.value?.id) {
      await stopsStore.update(props.trip.id, aeInitial.value.id, payload);
      toast.success("Stop updated");
    } else {
      await stopsStore.add(props.trip.id, payload);
      toast.success("Stop added");
    }
    aeOpen.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to save stop");
  }
};

// Delete
const isDeleteOpen = ref(false);
const deleting = ref(false);
const stopToDelete = ref<TripStop | null>(null);

const onDelete = (stop: TripStop) => {
  stopToDelete.value = stop;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!stopToDelete.value) return;
  try {
    deleting.value = true;
    await stopsStore.remove(props.trip.id, stopToDelete.value.id);
    toast.success("Stop removed");
    isDeleteOpen.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to remove stop");
  } finally {
    deleting.value = false;
    stopToDelete.value = null;
  }
};

// Gap Logic
const hasGap = (s1: TripStop, s2: TripStop) => {
  const end1 = new Date(s1.endDate).getTime();
  const start2 = new Date(s2.startDate).getTime();
  return start2 > end1;
};

const gapDuration = (s1: TripStop, s2: TripStop) => {
  const end1 = new Date(s1.endDate).getTime();
  const start2 = new Date(s2.startDate).getTime();
  const diffDays = Math.floor((start2 - end1) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "";
  return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
};
</script>
