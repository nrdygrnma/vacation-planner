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

        <div
          v-if="stop.type !== 'HUB' && stop.selectedAccommodation"
          class="bg-primary-50 rounded border border-primary-100 flex items-center justify-between group/stay cursor-pointer hover:bg-primary-100/50 transition-colors overflow-hidden h-12"
          @click="$emit('toggleExpand')"
        >
          <div class="flex items-center gap-3 min-w-0 flex-1 h-full">
            <div
              v-if="stop.selectedAccommodation.images?.length"
              class="w-16 h-full shrink-0 relative"
            >
              <img
                v-if="stop.selectedAccommodation.images?.[0]?.url"
                :src="stop.selectedAccommodation.images[0].url"
                alt="Stay"
                class="size-full object-cover"
              />
              <div
                v-if="stop.selectedAccommodation.images.length > 1"
                class="absolute bottom-0 right-0 bg-black/50 text-[8px] text-white px-1 font-bold z-10"
              >
                +{{ stop.selectedAccommodation.images.length - 1 }}
              </div>
            </div>
            <div
              v-else
              class="w-16 h-full bg-primary-100 flex items-center justify-center shrink-0"
            >
              <UIcon class="size-5 text-primary-600" name="i-lucide-bed" />
            </div>
            <div class="min-w-0 flex-1 py-1">
              <p class="text-xs font-semibold text-primary-900 truncate">
                {{ stop.selectedAccommodation.name }}
              </p>
              <div class="flex items-baseline gap-1.5 mt-0.5">
                <span class="text-sm font-bold text-primary-700">
                  {{
                    formatCurrency(
                      getDisplayPrice(stop.selectedAccommodation).value,
                      stop.selectedAccommodation,
                    )
                  }}
                </span>
                <span
                  class="text-[10px] text-primary-600/70 font-medium uppercase tracking-tight"
                >
                  {{ getDisplayPrice(stop.selectedAccommodation).label }}
                </span>
                <span
                  v-if="getSecondaryPrice(stop.selectedAccommodation)"
                  class="text-[10px] text-primary-500 italic ml-1"
                >
                  ({{
                    formatCurrency(
                      getSecondaryPrice(stop.selectedAccommodation)!.value,
                      stop.selectedAccommodation,
                    )
                  }}{{ getSecondaryPrice(stop.selectedAccommodation)!.label }})
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0 ml-auto pr-2">
            <div class="flex items-center">
              <UPopover
                v-if="stop.selectedAccommodation"
                :content="{ align: 'center', side: 'top', sideOffset: 8 }"
                arrow
              >
                <UButton
                  color="primary"
                  icon="i-lucide-eye"
                  size="xs"
                  variant="ghost"
                  @click.stop
                />
                <template #content>
                  <AccommodationsAccommodationDetails
                    :accommodation="stop.selectedAccommodation"
                    :date-range="dateRange"
                    :nights="nights"
                  />
                </template>
              </UPopover>
              <div class="w-8 flex justify-center">
                <UButton
                  v-if="stop.selectedAccommodation?.url"
                  :to="stop.selectedAccommodation.url"
                  color="primary"
                  icon="i-lucide-external-link"
                  size="xs"
                  target="_blank"
                  variant="ghost"
                  @click.stop
                />
              </div>
            </div>
            <UButton
              color="primary"
              icon="i-lucide-settings-2"
              size="xs"
              variant="ghost"
              @click.stop="$emit('toggleExpand')"
            />
            <UIcon
              :class="isExpanded ? 'rotate-180' : ''"
              class="size-4 text-primary-400 transition-transform duration-200"
              name="i-lucide-chevron-down"
            />
          </div>
        </div>
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
            <UButton
              color="neutral"
              label="Manage"
              size="xs"
              variant="ghost"
              @click.stop="$emit('toggleExpand')"
            />
            <UIcon
              :class="isExpanded ? 'rotate-180' : ''"
              class="size-4 text-gray-400 transition-transform duration-200"
              name="i-lucide-chevron-down"
            />
          </div>
        </div>
      </div>

      <!-- Expandable Accommodations Section -->
      <Transition
        v-if="stop.type !== 'HUB'"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isExpanded" class="mt-3 border-t pt-3 space-y-3">
          <div class="flex items-center justify-between px-1">
            <h4
              class="text-[11px] font-bold text-gray-500 uppercase tracking-wider"
            >
              Stays for {{ stop.name }}
            </h4>
            <UButton
              color="primary"
              icon="i-lucide-plus"
              label="New"
              size="xs"
              variant="soft"
              @click="openAddStay"
            />
          </div>

          <div v-if="modalView === 'list'" class="space-y-2">
            <div
              v-if="!stop.accommodations?.length"
              class="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-gray-400 italic text-xs"
            >
              No options added yet.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="acc in stop.accommodations"
                :key="acc.id"
                :class="
                  stop.selectedAccommodationId === acc.id
                    ? 'border-primary-200 bg-primary-50/30 ring-1 ring-primary-100'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                "
                class="border rounded-md flex items-center justify-between transition-all group/item overflow-hidden h-11"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1 h-full">
                  <div
                    v-if="acc.images?.[0]?.url"
                    class="w-12 h-full shrink-0 relative"
                  >
                    <img
                      :src="acc.images[0].url"
                      alt="Stay"
                      class="size-full object-cover"
                    />
                    <div
                      v-if="acc.images.length > 1"
                      class="absolute bottom-0 right-0 bg-black/50 text-[8px] text-white px-0.5 font-bold z-10"
                    >
                      +{{ acc.images.length - 1 }}
                    </div>
                  </div>
                  <div
                    v-else
                    class="w-12 h-full bg-gray-100 flex items-center justify-center shrink-0"
                  >
                    <UIcon
                      :class="
                        stop.selectedAccommodationId === acc.id
                          ? 'text-primary-600'
                          : 'text-gray-400'
                      "
                      class="size-4"
                      name="i-lucide-bed"
                    />
                  </div>
                  <div class="min-w-0 py-0.5">
                    <p class="text-xs font-semibold text-gray-900 truncate">
                      {{ acc.name }}
                    </p>
                    <p class="text-[10px] text-gray-500 truncate">
                      {{ acc.roomType || "Standard" }} ·
                      {{ acc.provider || "Direct" }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 flex-1 shrink-0 justify-end"
                >
                  <div class="text-right">
                    <p
                      class="text-[13px] font-extrabold text-gray-700 whitespace-nowrap leading-tight"
                    >
                      {{ formatCurrency(getDisplayPrice(acc).value, acc) }}
                    </p>
                    <div class="flex items-center justify-end gap-1">
                      <p
                        class="text-[9px] text-gray-400 uppercase font-bold tracking-tighter"
                      >
                        {{ getDisplayPrice(acc).label }}
                      </p>
                      <template v-if="getSecondaryPrice(acc)">
                        <p class="text-[9px] text-gray-400 italic">
                          ({{
                            formatCurrency(getSecondaryPrice(acc)!.value, acc)
                          }}{{ getSecondaryPrice(acc)!.label }})
                        </p>
                      </template>
                    </div>
                  </div>

                  <div
                    class="flex items-center border-l pl-2 pr-2 gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity min-w-[130px] justify-end"
                  >
                    <UButton
                      v-if="stop.selectedAccommodationId !== acc.id"
                      color="primary"
                      icon="i-lucide-check"
                      size="xs"
                      variant="ghost"
                      @click="onSelectStay(acc.id)"
                    />
                    <UButton
                      v-else
                      color="neutral"
                      icon="i-lucide-x"
                      size="xs"
                      variant="ghost"
                      @click="onSelectStay(null)"
                    />
                    <UPopover
                      :content="{ align: 'center', side: 'top', sideOffset: 8 }"
                      arrow
                    >
                      <UButton
                        color="neutral"
                        icon="i-lucide-eye"
                        size="xs"
                        variant="ghost"
                        @click.stop
                      />
                      <template #content>
                        <AccommodationsAccommodationDetails
                          :accommodation="acc"
                          :date-range="dateRange"
                          :nights="nights"
                        />
                      </template>
                    </UPopover>

                    <div class="w-8 flex justify-center">
                      <UButton
                        v-if="acc.url"
                        :to="acc.url"
                        color="neutral"
                        icon="i-lucide-external-link"
                        size="xs"
                        target="_blank"
                        variant="ghost"
                        @click.stop
                      />
                    </div>
                    <UButton
                      color="neutral"
                      icon="i-lucide-edit"
                      size="xs"
                      variant="ghost"
                      @click="onEditStay(acc)"
                    />
                    <UButton
                      color="error"
                      icon="i-lucide-trash"
                      size="xs"
                      variant="ghost"
                      @click="onDeleteStay(acc.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inline Form for Add/Edit -->
          <div
            v-else
            class="bg-gray-50 p-3 rounded-lg border border-gray-300 space-y-4"
          >
            <div class="flex items-center justify-between border-b pb-2 mb-2">
              <span class="text-xs font-bold text-gray-600">
                {{ aeStayMode === "add" ? "Add New Stay" : "Edit Stay" }}
              </span>
              <UButton
                color="neutral"
                icon="i-lucide-arrow-left"
                label="Cancel"
                size="xs"
                variant="ghost"
                @click="switchToList"
              />
            </div>

            <AccommodationFormNuxt
              ref="aeStayFormRef"
              :initial-values="aeStayInitial"
              class="scale-95 origin-top"
              @submit="saveStay"
            />

            <div class="flex justify-end gap-2 pt-2 border-t border-gray-300">
              <UButton
                :label="aeStayMode === 'add' ? 'Add Option' : 'Save Changes'"
                color="primary"
                size="sm"
                @click="onAeStaySubmit"
              />
            </div>
          </div>
        </div>
      </Transition>
    </template>

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
        <UButton
          color="neutral"
          icon="i-lucide-pencil"
          size="xs"
          variant="ghost"
          @click="$emit('edit', stop)"
        />
        <UButton
          color="error"
          icon="i-lucide-trash-2"
          size="xs"
          variant="ghost"
          @click="$emit('delete', stop)"
        />
      </div>
    </template>
  </BaseItemCard>
</template>

<script lang="ts" setup>
import BaseItemCard from "~/components/base/BaseItemCard.vue";
import type { TripStop } from "~/types/tripTypes";
// Manage Stays
import { useAccommodationsStore } from "~/stores/accommodations";
import AccommodationFormNuxt from "~/components/accommodations/AccommodationFormNuxt.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  stop: TripStop;
  isExpanded?: boolean;
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

const defaultImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLUXYAC-mJC1jWc36-WVG1LJyVNzW3AczJQ&s";
const dateRange = computed(() => {
  return `${formatDate(props.stop.startDate)} - ${formatDate(props.stop.endDate)}`;
});

const nights = computed(() => {
  const start = new Date(props.stop.startDate);
  const end = new Date(props.stop.endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const getDisplayPrice = (acc: any): { value: number; label: string } => {
  if (acc.totalPrice) return { value: Number(acc.totalPrice), label: "total" };
  if (acc.nightlyRate) {
    const total = Number(acc.nightlyRate) * nights.value;
    return { value: total, label: "total est." };
  }
  return { value: 0, label: "total" };
};

const getSecondaryPrice = (
  acc: any,
): { value: number; label: string } | null => {
  if (acc.totalPrice && nights.value > 0) {
    return { value: Number(acc.totalPrice) / nights.value, label: "/ night" };
  }
  if (acc.nightlyRate) {
    return { value: Number(acc.nightlyRate), label: "/ night" };
  }
  return null;
};

const formatCurrency = (val: number | string, acc?: any) => {
  const v = Number(val) || 0;
  const symbol =
    acc?.currency?.symbol ||
    props.stop.selectedAccommodation?.currency?.symbol ||
    "€";
  return `${symbol}${v.toFixed(2)}`;
};

const accommodationsStore = useAccommodationsStore();

const modalView = ref<"list" | "form">("list");

// Delete State
const isDeleteOpen = ref(false);
const deleting = ref(false);
const itemToDelete = ref<string | null>(null);

// Add/Edit Stay
const aeStayMode = ref<"add" | "edit">("add");
const aeStayInitial = ref<any>(null);
const aeStayFormRef = ref<any>(null);

const openAddStay = () => {
  aeStayMode.value = "add";
  aeStayInitial.value = {
    currencyId: props.stop.trip?.currencyId || "",
  };
  modalView.value = "form";
};

const onEditStay = (acc: any) => {
  aeStayMode.value = "edit";
  aeStayInitial.value = { ...acc };
  modalView.value = "form";
};

const switchToList = () => {
  modalView.value = "list";
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
    modalView.value = "list";
    // We should ideally refresh the trip/stop data here.
    // Since we don't have a direct 'refresh' emit from TripStopCard to its parent that is easily accessible,
    // we might need to rely on the fact that Pinia or the parent will handle it if we trigger a global refresh.
    // For now, let's assume the parent handles it via some mechanism or we add an emit.
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
