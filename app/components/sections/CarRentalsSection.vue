<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-car" /> Car Rentals
      </h3>
      <UButton
        id="add-car-rental-btn"
        color="primary"
        data-testid="add-car-rental-btn"
        icon="i-lucide-plus"
        label="Add car rental"
        size="sm"
        @click="openAdd"
      />
    </div>

    <div v-if="pending && !rentals.length" class="text-sm text-muted">
      Loading…
    </div>
    <div
      v-else-if="!rentals.length && !pending"
      class="text-sm italic text-muted"
    >
      No car rentals yet. Add one.
    </div>
    <div v-else class="grid gap-2 sm:grid-cols-2 lg:grid-cols-2 relative">
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
      <CarRentalCard
        v-for="r in rentals"
        :key="r.id"
        :people="trip.people"
        :rental="r"
        :selected="trip.selectedCarRentalId === r.id"
        :split-cost="trip.splitCarRentalCost"
        :trip-currency="trip.currency"
        @delete="onDelete(r)"
        @edit="onEdit(r)"
        @select="onSelect(r)"
      />
    </div>

    <CrudModal
      v-model:open="aeOpen"
      :description="
        aeMode === 'add'
          ? 'Create a new car rental for this trip'
          : 'Update car rental details'
      "
      :submit-label="submitLabel"
      :title="modalTitle"
      :ui="{ width: 'sm:max-w-4xl' }"
      @cancel="aeOpen = false"
      @submit="onModalSubmit"
    >
      <div data-testid="crud-modal-body">
        <CarRentalFormNuxt
          :key="aeMode + (aeInitial?.id || '')"
          ref="formRef"
          :initial-values="aeInitial"
          :submit-label="submitLabel"
          @cancel="aeOpen = false"
          @submit="save"
        />
      </div>
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      cancel-label="Cancel"
      confirm-label="Delete"
      description="This action cannot be undone."
      title="Delete car rental?"
      @cancel="isDeleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import CarRentalCard from "~/components/carRentals/CarRentalCard.vue";
import CarRentalFormNuxt from "~/components/carRentals/CarRentalFormNuxt.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { useCarRentalsStore } from "~/stores/carRentals";
import type { CarRentalOption, Trip } from "~/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const carRentalsStore = useCarRentalsStore();

const rentals = computed<CarRentalOption[]>(
  () => carRentalsStore.byTrip[props.trip.id]?.items ?? [],
);
const pending = computed<boolean>(
  () => carRentalsStore.byTrip[props.trip.id]?.pending ?? false,
);

onMounted(() => {
  carRentalsStore.fetchByTrip(props.trip.id);
});

// Add/Edit State
const aeOpen = ref(false);
const aeMode = ref<"add" | "edit">("add");
const aeInitial = ref<any>(null);
const formRef = ref<InstanceType<typeof CarRentalFormNuxt> | null>(null);

const modalTitle = computed(() =>
  aeMode.value === "add" ? "Add Car Rental" : "Edit Car Rental",
);
const submitLabel = computed(() =>
  aeMode.value === "add" ? "Add car rental" : "Save changes",
);

const openAdd = () => {
  aeMode.value = "add";
  aeInitial.value = null;
  aeOpen.value = true;
};

const onEdit = (r: CarRentalOption) => {
  aeMode.value = "edit";
  aeInitial.value = { ...r };
  aeOpen.value = true;
};

const onModalSubmit = () => {
  formRef.value?.submit?.();
};

const save = async (payload: any) => {
  try {
    if (aeMode.value === "edit" && aeInitial.value?.id) {
      await carRentalsStore.update(props.trip.id, aeInitial.value.id, payload);
      toast.success("Car rental updated");
    } else {
      await carRentalsStore.add(props.trip.id, payload);
      toast.success("Car rental added");
    }
    aeOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to save car rental");
  }
};

// Delete State
const isDeleteOpen = ref(false);
const deleting = ref(false);
const itemToDelete = ref<CarRentalOption | null>(null);

const onDelete = (r: CarRentalOption) => {
  itemToDelete.value = r;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    deleting.value = true;
    await carRentalsStore.remove(props.trip.id, itemToDelete.value.id);
    toast.success("Car rental removed");
    isDeleteOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to remove car rental");
  } finally {
    deleting.value = false;
    itemToDelete.value = null;
  }
};

const onSelect = async (r: CarRentalOption) => {
  try {
    const isSelected = props.trip.selectedCarRentalId === r.id;
    await carRentalsStore.selectFinal(props.trip.id, isSelected ? null : r.id);
    toast.success(
      isSelected ? "Car rental deselected" : "Car rental selected for trip",
    );
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to select/deselect car rental");
  }
};
</script>
