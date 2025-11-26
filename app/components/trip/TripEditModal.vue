<template>
  <div>
    <button
      :aria-controls="`trip-edit-${trip.id}`"
      :data-overlay="`#trip-edit-${trip.id}`"
      aria-haspopup="dialog"
      aria-label="Edit trip"
      class="btn btn-circle btn-sm"
      title="Edit"
      type="button"
    >
      <Icon class="size-4" name="lucide:pencil" />
    </button>

    <div
      :id="`trip-edit-${trip.id}`"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 justify-center items-start pt-24 md:pt-28 lg:pt-32"
      role="dialog"
      tabindex="-1"
    >
      <!-- Transparent backdrop -->
      <button
        :data-overlay="`#trip-edit-${trip.id}`"
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/30"
        @click="closeOverlay"
        type="button"
      ></button>

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Trip</h3>
            <button
              :data-overlay="`#trip-edit-${trip.id}`"
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              @click="closeOverlay"
            >
              ✕
            </button>
          </div>

          <div class="modal-body">
            <TripForm
              :initialValues="initialValues"
              @cancel="close"
              @submit="submit"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TripForm from "./TripForm.vue";
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{ (e: "saved"): void }>();

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

const initialValues = computed(() => ({
  title: props.trip.title,
  imageUrl: props.trip.imageUrl ?? "",
  startDate: toDateInput(props.trip.startDate ?? null),
  endDate: toDateInput(props.trip.endDate ?? null),
  people: props.trip.people,
  currencyId: props.trip.currencyId,
}));

async function submit(data: any) {
  try {
    await $fetch(`/api/trips/${props.trip.id}`, {
      method: "PUT",
      body: {
        title: data.title,
        imageUrl: data.imageUrl || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        people: data.people,
        currencyId: data.currencyId,
      },
    });

    await refreshNuxtData("trips");
    close();
    emit("saved");
    toast.success("Trip updated");
  } catch (e) {
    console.error(e);
    toast.error("Failed to update trip");
  }
}

function closeOverlay() {
  const id = `trip-edit-${props.trip.id}`;
  const trigger = document.querySelector(
    `[data-overlay="#${id}"]`,
  ) as HTMLElement | null;
  trigger?.click();
  const overlay = document.getElementById(id);
  overlay?.classList.add("hidden");
  overlay?.classList.remove("overlay-open");
  // Clean any global modal state classes FlyonUI might add
  document.documentElement.classList.remove("overlay-open");
  document.body.classList.remove("overlay-open");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  // Remove injected backdrop element if the library left it behind
  const backdrop = document.getElementById(`${id}-backdrop`);
  backdrop?.remove();
  // Fallback: remove or neutralize any leftover overlay backdrops when no overlay is open
  document
    .querySelectorAll<HTMLElement>(".overlay-backdrop")
    .forEach((el) => {
      if (
        el.id === `${id}-backdrop` ||
        el.classList.contains("opacity-0") ||
        !document.querySelector(".overlay.overlay-open")
      ) {
        el.remove();
      }
    });
  trigger?.focus({ preventScroll: true });
}

function close() {
  closeOverlay();
}
</script>
