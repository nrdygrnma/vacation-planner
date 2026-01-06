<template>
  <BaseItemCard
    :class="[
      'relative group',
      stop.type === 'HUB'
        ? 'bg-primary-50/20 border-primary-100 shadow-sm'
        : '',
    ]"
    :selectable="false"
  >
    <template #title>
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <UIcon
          class="size-4 text-gray-400 cursor-grab active:cursor-grabbing shrink-0 drag-handle"
          name="i-lucide-grip-vertical"
        />
        <UIcon
          :class="stop.type === 'HUB' ? 'text-primary-700' : 'text-gray-600'"
          :name="stop.type === 'HUB' ? 'i-lucide-plane' : 'i-lucide-map-pin'"
          class="size-4 shrink-0"
        />
        <span
          :class="{ 'text-primary-700': stop.type === 'HUB' }"
          class="font-medium truncate text-lg"
        >
          {{ stop.name }}
          <span
            v-if="stop.type === 'HUB'"
            class="text-[9px] uppercase tracking-tighter bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full ml-2 font-black border border-primary-200"
          >
            Hub
          </span>
        </span>
      </div>
    </template>

    <template #subtitle>
      <div class="space-y-2 mt-1">
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <UIcon class="size-3" name="i-lucide-calendar" />
            <span>{{ dateRange }}</span>
          </div>
          <div v-if="stop.type !== 'HUB'" class="flex items-center gap-1">
            <UIcon class="size-3" name="i-lucide-moon" />
            <span>{{ nights }} {{ nights === 1 ? "night" : "nights" }}</span>
          </div>
          <div
            v-else
            class="flex items-center gap-1 text-primary-600 font-medium"
          >
            <UIcon class="size-3" name="i-lucide-plane-landing" />
            <span>Transit Point</span>
          </div>
        </div>

        <TripStopSelectedAccommodation
          v-if="stop.type !== 'HUB' && stop.selectedAccommodation"
          :date-range="dateRange"
          :is-expanded="isExpanded || false"
          :nights="nights"
          :stop="stop"
          :trip-currency="tripCurrency"
          @toggle-expand="$emit('toggleExpand')"
        />
        <div
          v-else-if="stop.type !== 'HUB'"
          class="border border-dashed border-gray-300 p-2 rounded flex items-center justify-between text-xs text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="$emit('toggleExpand')"
        >
          <div class="flex items-center gap-2">
            <UIcon class="size-4 shrink-0" name="i-lucide-bed" />
            <span>No accommodation selected</span>
          </div>
          <div class="flex items-center gap-1">
            <UTooltip
              :content="{
                align: 'center',
                side: 'top',
                sideOffset: 8,
              }"
              arrow
              text="Manage"
            >
              <UButton
                color="neutral"
                icon="lucide-chevron-up"
                target="_blank"
                variant="link"
                @click.stop="$emit('toggleExpand')"
              />
            </UTooltip>

            <UIcon
              :class="isExpanded ? 'rotate-180' : ''"
              class="size-4 text-gray-400 transition-transform duration-200"
              name="i-lucide-chevron-down"
            />
          </div>
        </div>
      </div>

      <TripStopAccommodationOptions
        v-if="stop.type !== 'HUB'"
        :date-range="dateRange"
        :is-expanded="isExpanded || false"
        :nights="nights"
        :stop="stop"
        :trip-currency="tripCurrency"
        @add="openAddStay"
        @delete="onDeleteStay"
        @edit="onEditStay"
        @select="onSelectStay"
      />
    </template>

    <CrudModal
      v-model:open="aeStayOpen"
      :description="
        aeStayMode === 'add'
          ? 'Add a new accommodation option for this stop'
          : 'Update accommodation details'
      "
      :submit-label="submitLabel"
      :title="modalTitle"
      @cancel="aeStayOpen = false"
      @submit="onAeStaySubmit"
    >
      <AccommodationFormNuxt
        :key="aeStayMode + (aeStayInitial?.id || '')"
        ref="aeStayFormRef"
        :initial-values="aeStayInitial"
        @cancel="aeStayOpen = false"
        @submit="saveStay"
      />
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      description="This accommodation option will be permanently removed."
      title="Delete accommodation?"
      @confirm="confirmDelete"
    />

    <template #trailing>
      <div
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            color="neutral"
            icon="i-lucide-pencil"
            variant="outline"
            @click="$emit('edit', stop)"
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
            @click="$emit('delete', stop)"
          />
        </UTooltip>
      </div>
    </template>
  </BaseItemCard>
</template>

<script lang="ts" setup>
import BaseItemCard from "~/components/base/BaseItemCard.vue";
import type { Currency, TripStop } from "~/types/tripTypes";
import { useAccommodationsStore } from "~/stores/accommodations";
import AccommodationFormNuxt from "~/components/accommodations/AccommodationFormNuxt.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { toast } from "vue-sonner";
import CrudModal from "~/components/base/CrudModal.vue";
import TripStopSelectedAccommodation from "./card/TripStopSelectedAccommodation.vue";
import TripStopAccommodationOptions from "./card/TripStopAccommodationOptions.vue";

const props = defineProps<{
  stop: TripStop;
  isExpanded?: boolean;
  tripCurrency?: Currency;
}>();

const emit = defineEmits<{
  (e: "edit", stop: TripStop): void;
  (e: "delete", stop: TripStop): void;
  (e: "refresh"): void;
  (e: "toggleExpand"): void;
}>();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const dateRange = computed(() => {
  return `${formatDate(props.stop.startDate)} - ${formatDate(props.stop.endDate)}`;
});

const nights = computed(() => {
  const start = new Date(props.stop.startDate);
  const end = new Date(props.stop.endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const accommodationsStore = useAccommodationsStore();

// Delete State
const isDeleteOpen = ref(false);
const deleting = ref(false);
const itemToDelete = ref<string | null>(null);

// Add/Edit Stay
const aeStayOpen = ref(false);
const aeStayMode = ref<"add" | "edit">("add");
const aeStayInitial = ref<any>(null);
const aeStayFormRef = ref<any>(null);

const modalTitle = computed(() =>
  aeStayMode.value === "add" ? "Add Accommodation" : "Edit Accommodation",
);
const submitLabel = computed(() =>
  aeStayMode.value === "add" ? "Add Option" : "Save Changes",
);

const openAddStay = () => {
  aeStayMode.value = "add";
  aeStayInitial.value = {
    currencyId: props.stop.trip?.currencyId || "",
  };
  aeStayOpen.value = true;
};

const onEditStay = (acc: any) => {
  aeStayMode.value = "edit";
  aeStayInitial.value = { ...acc };
  aeStayOpen.value = true;
};

const onAeStaySubmit = () => {
  aeStayFormRef.value?.submit?.();
};

const saveStay = async (payload: any) => {
  try {
    if (aeStayMode.value === "edit" && aeStayInitial.value?.id) {
      await accommodationsStore.update(
        props.stop.tripId,
        props.stop.id,
        aeStayInitial.value.id,
        payload,
      );
      toast.success("Accommodation updated");
    } else {
      await accommodationsStore.add(props.stop.tripId, props.stop.id, payload);
      toast.success("Accommodation added");
    }
    aeStayOpen.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to save accommodation");
  }
};

const onSelectStay = async (accommodationId: string | null) => {
  try {
    await accommodationsStore.selectFinal(
      props.stop.tripId,
      props.stop.id,
      accommodationId,
    );
    toast.success(
      accommodationId ? "Accommodation selected" : "Accommodation unselected",
    );
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to select accommodation");
  }
};

const onDeleteStay = async (accommodationId: string) => {
  itemToDelete.value = accommodationId;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    deleting.value = true;
    await accommodationsStore.remove(
      props.stop.tripId,
      props.stop.id,
      itemToDelete.value,
    );
    toast.success("Accommodation removed");
    isDeleteOpen.value = false;
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to remove accommodation");
  } finally {
    deleting.value = false;
    itemToDelete.value = null;
  }
};
</script>
