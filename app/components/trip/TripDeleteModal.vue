<template>
  <div>
    <button
      :aria-controls="`trip-delete-${trip.id}`"
      :data-overlay="`#trip-delete-${trip.id}`"
      aria-haspopup="dialog"
      aria-label="Delete trip"
      class="btn btn-error btn-circle btn-sm"
      title="Delete"
      type="button"
    >
      <Icon class="size-4" name="lucide:trash-2" />
    </button>

    <!-- Modal -->
    <div
      :id="`trip-delete-${trip.id}`"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 justify-center items-start pt-24 md:pt-32 lg:pt-40"
      role="dialog"
      tabindex="-1"
    >
      <!-- Transparent backdrop -->
      <button
        :data-overlay="`#trip-delete-${trip.id}`"
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/30"
        @click="closeOverlay"
        type="button"
      ></button>

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Delete Trip</h3>
            <button
              :data-overlay="`#trip-delete-${trip.id}`"
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              @click="closeOverlay"
            >
              ✕
            </button>
          </div>

          <div class="modal-body space-y-2">
            <p>Are you sure you want to delete "{{ trip.title }}"?</p>
            <p class="text-base-content/70 text-sm">
              This action cannot be undone.
            </p>
          </div>

          <div class="modal-footer flex items-center justify-end gap-2">
            <button
              :data-overlay="`#trip-delete-${trip.id}`"
              class="btn btn-secondary btn-sm"
              @click="closeOverlay"
              type="button"
            >
              Cancel
            </button>
            <button
              class="btn btn-error btn-sm"
              type="button"
              @click="onDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{ (e: "deleted"): void }>();

function closeOverlay() {
  const id = `trip-delete-${props.trip.id}`;
  const trigger = document.querySelector(
    `[data-overlay="#${id}"]`,
  ) as HTMLElement | null;
  // Use FlyonUI toggle on the trigger
  trigger?.click();
  // Force-clean overlay state to avoid stuck backdrop
  const overlay = document.getElementById(id);
  overlay?.classList.add("hidden");
  overlay?.classList.remove("overlay-open");
  document.documentElement.classList.remove("overlay-open");
  document.body.classList.remove("overlay-open");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  // Remove injected backdrop element if library left it behind
  const backdrop = document.getElementById(`${id}-backdrop`);
  backdrop?.remove();
  // Fallback: neutralize any leftover overlay-backdrop elements
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
  // Restore focus to trigger
  trigger?.focus({ preventScroll: true });
}

const onDelete = async () => {
  try {
    await $fetch(`/api/trips/${props.trip.id}`, { method: "DELETE" });
    closeOverlay();
    toast.success("Trip deleted");
    emit("deleted");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.data?.statusMessage || "Failed to delete trip");
  }
};
</script>
