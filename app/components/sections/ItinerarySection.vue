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

    <div v-if="pending" class="text-sm text-muted">Loading…</div>
    <div v-else-if="!stops.length" class="text-sm italic text-muted">
      No stops planned yet. Start building your itinerary.
    </div>

    <div v-else class="relative pl-8 space-y-4">
      <!-- Vertical line -->
      <div class="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200"></div>

      <div v-for="(stop, idx) in stops" :key="stop.id" class="relative">
        <!-- Dot on the line -->
        <div
          class="absolute -left-[22px] top-6 size-3 rounded-full border-2 border-white bg-primary-500 z-10"
        ></div>

        <TripStopCard
          :stop="stop"
          @delete="onDelete(stop)"
          @edit="onEdit(stop)"
          @refresh="stopsStore.fetchByTrip(trip.id)"
        />

        <!-- Gap indicator between stops -->
        <div
          v-if="idx < stops.length - 1 && hasGap(stop, stops[idx + 1])"
          class="my-2 py-1 px-3 bg-orange-50 rounded border border-orange-100 text-[10px] text-orange-600 font-medium inline-block ml-4"
        >
          <UIcon class="size-3 mr-1" name="i-lucide-clock" />
          {{ gapDuration(stop, stops[idx + 1]) }} unplanned
        </div>
      </div>
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
  </div>
</template>

<script lang="ts" setup>
import TripStopCard from "~/components/tripStops/TripStopCard.vue";
import TripStopFormNuxt from "~/components/tripStops/TripStopFormNuxt.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { useTripStopsStore } from "~/stores/tripStops";
import type { Trip, TripStop } from "~/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{
  trip: Trip;
}>();

const stopsStore = useTripStopsStore();

const stops = computed(() => stopsStore.byTrip[props.trip.id]?.items ?? []);
const pending = computed(
  () => stopsStore.byTrip[props.trip.id]?.pending ?? false,
);

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
