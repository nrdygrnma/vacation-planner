<template>
  <section v-if="trip" class="space-y-2">
    <div>
      <UButton
        color="neutral"
        icon="i-lucide-arrow-left"
        size="xs"
        variant="ghost"
        @click="navigateTo('/')"
      >
        Back
      </UButton>
    </div>

    <TripDetailsHero :coverPosition="'center_20%'" :trip="trip" />

    <TripDetailsHeader :trip="trip" @delete="openDelete()" @edit="openEdit()" />

    <div class="space-y-3">
      <UTabs v-model="activeTab" :items="tabItems" />

      <FlightsSection
        v-if="activeTab === 'flights'"
        :trip="trip"
        @refresh="refresh"
      />
      <CarRentalsSection
        v-else-if="activeTab === 'cars'"
        :trip="trip"
        @refresh="refresh"
      />
      <ItinerarySection v-else-if="activeTab === 'itinerary'" :trip="trip" />
    </div>

    <CrudModal
      v-model:open="isEditOpen"
      :description="'Update trip details'"
      :title="'Edit Trip'"
      submit-label="Save changes"
      @cancel="onEditCancel"
      @submit="onEditModalSubmit"
    >
      <TripFormNuxt
        v-if="trip"
        :key="editFormKey"
        ref="tripEditFormRef"
        :initial-values="editInitialValues"
        submit-label="Save changes"
        @cancel="onEditCancel"
        @submit="onEditSubmit"
      />
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :title="deleteTitle"
      cancel-label="Cancel"
      confirm-label="Delete"
      description="This action cannot be undone."
      @cancel="onDeleteCancel"
      @confirm="onDeleteConfirm"
    />
  </section>

  <section v-else class="py-10">
    <div v-if="pending" class="opacity-70">Loading…</div>
    <UAlert
      v-else
      color="error"
      description="The trip you are looking for does not exist or was removed."
      icon="i-lucide-octagon-alert"
      title="Trip not found"
    />
  </section>
</template>

<script lang="ts" setup>
import TripDetailsHero from "~/components/trips/TripDetailsHero.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import TripFormNuxt from "~/components/trips/TripFormNuxt.vue";
import { useTrip } from "@/composables/useTrip";
import { useTripsStore } from "@/stores/trips";
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";
import TripDetailsHeader from "~/components/trips/TripDetailsHeader.vue";
import FlightsSection from "~/components/sections/FlightsSection.vue";
import CarRentalsSection from "~/components/sections/CarRentalsSection.vue";
import ItinerarySection from "~/components/sections/ItinerarySection.vue";

const route = useRoute();
const tripId = computed(() => String(route.params.id || ""));
const { trip, refresh, pending } = useTrip(tripId.value);

// --------------------
// Tabs
// --------------------
const tabItems = [
  { label: "Flights", icon: "i-lucide-plane", value: "flights" },
  { label: "Car Rentals", icon: "i-lucide-car", value: "cars" },
  { label: "Itinerary", icon: "i-lucide-map-pin", value: "itinerary" },
];
const activeTab = ref<string>("flights");

// --------------------
// Delete flow
// --------------------
const isDeleteOpen = ref(false);
const deleting = ref(false);
const tripsStore = useTripsStore();

const openDelete = () => {
  isDeleteOpen.value = true;
};
const onDeleteCancel = () => {
  isDeleteOpen.value = false;
};
const deleteTitle = computed(() =>
  trip.value ? `Delete "${trip.value.title}"?` : "Delete item",
);
const onDeleteConfirm = async () => {
  if (!trip.value) return;
  try {
    deleting.value = true;
    await tripsStore.deleteTrip(trip.value.id as string);
    toast.success("Trip deleted");
    navigateTo("/");
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete trip");
  } finally {
    deleting.value = false;
    isDeleteOpen.value = false;
  }
};

// --------------------
// Edit flow
// --------------------
const isEditOpen = ref(false);
const editFormKey = ref(0);
const tripEditFormRef = ref<InstanceType<typeof TripFormNuxt> | null>(null);

const toDateInput = (value: unknown): string => {
  if (!value) return "";
  try {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const d = new Date(value as any);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
};

const editInitialValues = computed(() => {
  const t = trip.value as unknown as Trip | null;
  if (!t) return undefined as any;
  return {
    title: t.title,
    imageUrl: (t as any).imageUrl ?? "",
    startDate: toDateInput((t as any).startDate),
    endDate: toDateInput((t as any).endDate),
    people: (t as any).people ?? 1,
    currencyId: (t as any).currencyId ?? (t as any).currency?.id ?? "",
  };
});

const openEdit = () => {
  editFormKey.value++;
  isEditOpen.value = true;
};
const onEditCancel = () => {
  isEditOpen.value = false;
};
const onEditModalSubmit = () => {
  tripEditFormRef.value?.submit?.();
};
const onEditSubmit = async (data: any) => {
  try {
    if (!trip.value) return;
    await tripsStore.updateTrip(trip.value.id as string, data);
    toast.success("Trip updated");
    isEditOpen.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    toast.error("Failed to update trip");
  }
};
</script>
