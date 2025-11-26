<template>
  <div>
    <button
      aria-controls="trip-create-modal"
      aria-haspopup="dialog"
      class="btn btn-primary btn-sm inline-flex items-center gap-2"
      type="button"
      ref="triggerRef"
      @click="openOverlay"
    >
      <Icon class="size-4" name="lucide:plus" />
      New Trip
    </button>

    <div
      id="trip-create-modal"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 flex justify-center items-start pt-24 md:pt-28 lg:pt-32"
      role="dialog"
      tabindex="-1"
    >
      <!-- Backdrop -->
      <button
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/30"
        type="button"
        @click.stop.prevent="closeOverlay"
      />

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Create Trip</h3>
            <button
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              type="button"
              @click.stop.prevent="closeOverlay"
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

const triggerRef = ref<HTMLElement | null>(null);

let prevBodyOverflow: string | null = null;
let prevBodyPaddingRight: string | null = null;

const getScrollbarCompensation = (): number => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

const lockScroll = () => {
  const body = document.body;
  prevBodyOverflow = body.style.overflow;
  prevBodyPaddingRight = body.style.paddingRight;
  const compensate = getScrollbarCompensation();
  body.style.overflow = "hidden";
  if (compensate > 0) body.style.paddingRight = `${compensate}px`;
  document.documentElement.style.overflow = "hidden";
};

const unlockScroll = () => {
  const body = document.body;
  body.style.overflow = prevBodyOverflow || "";
  body.style.paddingRight = prevBodyPaddingRight || "";
  document.documentElement.style.overflow = "";
};

const openOverlay = () => {
  const overlay = document.getElementById("trip-create-modal");
  if (!overlay) return;
  overlay.classList.remove("hidden");
  overlay.classList.remove("opacity-0");
  overlay.classList.add("overlay-open", "flex", "opacity-100");
  document.documentElement.classList.add("overlay-open", "modal-open");
  document.body.classList.add("overlay-open", "modal-open");
  lockScroll();
  (
    overlay.querySelector(
      "[tabindex],button,input,select,textarea,a[href]",
    ) as HTMLElement | null
  )?.focus?.({ preventScroll: true });
};

const closeOverlay = (ev?: Event) => {
  ev?.preventDefault?.();
  ev?.stopPropagation?.();
  const overlay = document.getElementById("trip-create-modal");
  overlay?.classList.add("hidden");
  overlay?.classList.remove("overlay-open", "flex", "opacity-100");
  document.documentElement.classList.remove("overlay-open");
  document.body.classList.remove("overlay-open");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  unlockScroll();

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
  triggerRef?.value?.focus?.({ preventScroll: true });
};

const submit = async (data: any) => {
  await $fetch("/api/trips", { method: "POST", body: data });
  closeOverlay();
  emit("saved");
  toast.success("Trip created");
};
</script>
