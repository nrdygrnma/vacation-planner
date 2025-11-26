<template>
  <div>
    <button
      ref="triggerRef"
      :aria-controls="`trip-edit-${trip.id}`"
      aria-haspopup="dialog"
      aria-label="Edit trip"
      class="btn btn-circle btn-sm"
      title="Edit"
      type="button"
      @click="openOverlay"
    >
      <Icon class="size-4" name="lucide:pencil" />
    </button>

    <div
      :id="`trip-edit-${trip.id}`"
      aria-modal="true"
      class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden fixed inset-0 z-50 flex justify-center items-start pt-24 md:pt-28 lg:pt-32"
      role="dialog"
      tabindex="-1"
    >
      <!-- Transparent backdrop -->
      <button
        aria-label="Close"
        class="absolute inset-0 z-0 bg-base-content/50 flex"
        type="button"
        @click.stop.prevent="closeOverlay"
      ></button>

      <div class="modal-dialog relative z-10">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Trip</h3>
            <button
              aria-label="Close"
              class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              @click.stop.prevent="closeOverlay"
            >
              ✕
            </button>
          </div>

          <div class="modal-body">
            <TripForm
              :initialValues="initialValues"
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
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{ (e: "saved"): void }>();

// Keep a reference to trigger to restore focus
const triggerRef = ref<HTMLElement | null>(null);

let prevBodyOverflow: string | null = null;
let prevBodyPaddingRight: string | null = null;

const getScrollbarCompensation = (): number => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

const lockScroll = () => {
  if (typeof document === "undefined") return;
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

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

const initialValues = computed(() => ({
  title: props.trip.title,
  imageUrl: props.trip.imageUrl ?? "",
  startDate: toDateInput(props.trip.startDate ?? null),
  endDate: toDateInput(props.trip.endDate ?? null),
  people: props.trip.people,
  currencyId: props.trip.currencyId,
}));

const openOverlay = () => {
  const id = `trip-edit-${props.trip.id}`;
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
};

const closeOverlay = (ev?: Event) => {
  ev?.preventDefault?.();
  ev?.stopPropagation?.();
  const id = `trip-edit-${props.trip.id}`;
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
};

const submit = async (data: any) => {
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
    closeOverlay();
    emit("saved");
    toast.success("Trip updated");
  } catch (e) {
    console.error(e);
    toast.error("Failed to update trips");
  }
};
</script>
