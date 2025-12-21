<template>
  <section class="space-y-6">
    <TripsToolbar v-model="search" @open-create="onOpenCreate" />

    <TripGrid
      v-if="filtered.length"
      :trips="filtered"
      @changed="refresh()"
      @delete="onCardDelete"
      @edit="onCardEdit"
      @open="onCardOpen"
    />

    <TripsEmptyState v-else :total="items?.length || 0" />

    <CrudModal
      v-model:open="isFormOpen"
      :description="formDescription"
      :submit-label="formSubmitLabel"
      :title="formTitle"
      @cancel="onFormCancel"
      @submit="onFormModalSubmit"
    >
      <TripFormNuxt
        :key="formKey"
        ref="tripFormRef"
        :initial-values="formInitialValues"
        @cancel="onFormCancel"
        @submit="onFormSubmit"
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
</template>

<script lang="ts" setup>
import TripsToolbar from "@/components/trips/TripsToolbar.vue";
import TripGrid from "@/components/trips/TripGrid.vue";
import TripsEmptyState from "@/components/trips/TripsEmptyState.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import TripFormNuxt from "@/components/trips/TripFormNuxt.vue";
import { storeToRefs } from "pinia";
import { useTripsStore } from "@/stores/trips";
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const tripsStore = useTripsStore();
const { items, filtered, search, pending } = storeToRefs(tripsStore);

const isDeleteOpen = ref(false);
const deleting = ref(false);
const tripToDelete = ref<Trip | null>(null);

const isFormOpen = ref(false);
const formMode = ref<"create" | "edit">("create");
const currentTrip = ref<Trip | null>(null);
const formKey = ref(0);
const tripFormRef = ref<InstanceType<typeof TripFormNuxt> | null>(null);

const onCardOpen = (trip: Trip) => {
  navigateTo(`/trips/${trip.id}`);
};

const onCardDelete = (trip: Trip) => {
  tripToDelete.value = trip;
  isDeleteOpen.value = true;
};

const onDeleteCancel = () => {
  isDeleteOpen.value = false;
  tripToDelete.value = null;
};

const onDeleteConfirm = async () => {
  if (!tripToDelete.value) return;
  try {
    deleting.value = true;
    await tripsStore.deleteTrip(tripToDelete.value.id);
    await refresh();
    toast.success("Trip deleted");
    isDeleteOpen.value = false;
    tripToDelete.value = null;
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete trip");
  } finally {
    deleting.value = false;
  }
};

const deleteTitle = computed(() =>
  tripToDelete.value ? `Delete "${tripToDelete.value.title}"?` : "Delete item",
);

const refresh = () => tripsStore.fetchTrips();

const onOpenCreate = () => {
  formMode.value = "create";
  currentTrip.value = null;
  formKey.value++;
  isFormOpen.value = true;
};

const onFormCancel = () => {
  isFormOpen.value = false;
};

const onFormModalSubmit = () => {
  tripFormRef.value?.submit?.();
};

const onFormSubmit = async (data: any) => {
  try {
    if (formMode.value === "create") {
      await tripsStore.createTrip(data);
      toast.success("Trip created");
    } else if (formMode.value === "edit" && currentTrip.value) {
      await tripsStore.updateTrip(currentTrip.value.id, data);
      toast.success("Trip updated");
    }
    isFormOpen.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    toast.error(
      formMode.value === "create"
        ? "Failed to create trip"
        : "Failed to update trip",
    );
  }
};

watch(isFormOpen, (open) => {
  if (!open) {
    setTimeout(() => {
      currentTrip.value = null;
      formKey.value++;
    }, 200);
  }
});

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

const formInitialValues = computed(() => {
  const t = currentTrip.value;
  if (formMode.value !== "edit" || !t) return undefined as any;
  return {
    title: t.title,
    imageUrl: (t as any).imageUrl ?? "",
    startDate: toDateInput((t as any).startDate),
    endDate: toDateInput((t as any).endDate),
    people: (t as any).people ?? 1,
    currencyId: (t as any).currencyId ?? (t as any).currency?.id ?? "",
  };
});

const onCardEdit = (trip: Trip) => {
  formMode.value = "edit";
  currentTrip.value = trip;
  formKey.value++;
  isFormOpen.value = true;
};

const formTitle = computed(() =>
  formMode.value === "create" ? "Create Trip" : "Edit Trip",
);
const formDescription = computed(() =>
  formMode.value === "create" ? "Add a new trip" : "Update trip details",
);
const formSubmitLabel = computed(() =>
  formMode.value === "create" ? "Create" : "Save changes",
);

onMounted(() => {
  if (!items.value?.length) tripsStore.fetchTrips();
});
</script>
