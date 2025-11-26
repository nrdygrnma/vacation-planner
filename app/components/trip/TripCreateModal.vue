<template>
  <div>
    <button
      aria-controls="trip-create-modal"
      aria-haspopup="dialog"
      class="btn btn-primary btn-sm inline-flex items-center gap-2"
      data-overlay="#trip-create-modal"
      type="button"
    >
      <Icon class="size-4" name="lucide:plus" />
      New Trip
    </button>

    <div
      id="trip-create-modal"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 justify-center items-start pt-24 md:pt-28 lg:pt-32"
      role="dialog"
      tabindex="-1"
    >
      <!-- Backdrop -->
      <button
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/30"
        type="button"
        @click="closeOverlay"
      />

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Create Trip</h3>
            <button
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              type="button"
              @click="closeOverlay"
            >
              ✕
            </button>
          </div>

          <div class="modal-body">
            <TripForm
              :reset-on-submit="true"
              @cancel="closeOverlay"
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
import { toast } from "vue-sonner";

const emit = defineEmits(["saved"]);

const closeOverlay = () => {
  const trigger = document.querySelector(
    `[data-overlay="#trip-create-modal"]`,
  ) as HTMLElement | null;

  trigger?.click();
  const overlay = document.getElementById("trip-create-modal");
  overlay?.classList.add("hidden");
  overlay?.classList.remove("overlay-open");
  document.documentElement.classList.remove("overlay-open");
  document.body.classList.remove("overlay-open");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");

  const backdrop = document.getElementById("trip-create-modal-backdrop");
  backdrop?.remove();

  document.querySelectorAll<HTMLElement>(".overlay-backdrop").forEach((el) => {
    if (
      el.id === "trip-create-modal-backdrop" ||
      el.classList.contains("opacity-0") ||
      !document.querySelector(".overlay.overlay-open")
    ) {
      el.remove();
    }
  });
  trigger?.focus({ preventScroll: true });
};

const submit = async (data: any) => {
  await $fetch("/api/trips", { method: "POST", body: data });
  closeOverlay();
  emit("saved");
  toast.success("Trip created");
};
</script>
