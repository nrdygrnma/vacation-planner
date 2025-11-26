<template>
  <div>
    <button
      ref="triggerRef"
      :aria-controls="`trip-delete-${trip.id}`"
      aria-haspopup="dialog"
      aria-label="Delete trip"
      class="btn btn-error btn-circle btn-sm"
      title="Delete"
      type="button"
      @click="openOverlay"
    >
      <Icon class="size-4" name="lucide:trash-2" />
    </button>

    <!-- Modal -->
    <div
      :id="`trip-delete-${trip.id}`"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 flex justify-center items-start pt-24 md:pt-32 lg:pt-40"
      role="dialog"
      tabindex="-1"
    >
      <!-- Transparent backdrop -->
      <button
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/50"
        type="button"
        @click.stop.prevent="closeOverlay"
      ></button>

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Delete Trip</h3>
            <button
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              @click.stop.prevent="closeOverlay"
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
              class="btn btn-secondary btn-sm"
              type="button"
              @click.stop.prevent="closeOverlay"
            >
              Cancel
            </button>
            <button
              class="btn btn-error btn-sm"
              type="button"
              @click.stop.prevent="onDelete"
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

// Keep a ref to the trigger for focus restoration
const triggerRef = ref<HTMLElement | null>(null);

let prevBodyOverflow: string | null = null;
let prevBodyPaddingRight: string | null = null;

function getScrollbarCompensation(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockScroll() {
  if (typeof window === "undefined") return;
  const body = document.body;
  prevBodyOverflow = body.style.overflow;
  prevBodyPaddingRight = body.style.paddingRight;
  const compensate = getScrollbarCompensation();
  body.style.overflow = "hidden";
  if (compensate > 0) body.style.paddingRight = `${compensate}px`;
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  const body = document.body;
  body.style.overflow = prevBodyOverflow || "";
  body.style.paddingRight = prevBodyPaddingRight || "";
  document.documentElement.style.overflow = "";
}

function openOverlay() {
  const id = `trip-delete-${props.trip.id}`;
  const overlay = document.getElementById(id);
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
}
function closeOverlay(ev?: Event) {
  ev?.preventDefault?.();
  ev?.stopPropagation?.();
  const id = `trip-delete-${props.trip.id}`;
  const overlay = document.getElementById(id);
  overlay?.classList.add("hidden");
  overlay?.classList.remove("overlay-open", "flex", "opacity-100");
  document.documentElement.classList.remove("overlay-open");
  document.body.classList.remove("overlay-open");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  unlockScroll();

  const backdrop = document.getElementById(`${id}-backdrop`);
  backdrop?.remove();

  document.querySelectorAll<HTMLElement>(".overlay-backdrop").forEach((el) => {
    if (
      el.id === `${id}-backdrop` ||
      el.classList.contains("opacity-0") ||
      !document.querySelector(".overlay.overlay-open")
    ) {
      el.remove();
    }
  });
  triggerRef?.value?.focus?.({ preventScroll: true });
}

const onDelete = async () => {
  try {
    await $fetch(`/api/trips/${props.trip.id}`, { method: "DELETE" });
    closeOverlay();
    toast.success("Trip deleted");
    emit("deleted");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.data?.statusMessage || "Failed to delete trips");
  }
};
</script>
