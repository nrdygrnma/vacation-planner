<template>
  <div
    :id="id"
    ref="overlayRef"
    class="overlay modal hidden fixed inset-0 z-50 overlay-backdrop-open:bg-base-content/50 overlay-open:opacity-100 overlay-open:duration-300 [--body-scroll:false]"
    role="dialog"
    tabindex="-1"
  >
    <div class="modal-dialog modal-dialog-md">
      <div class="modal-content">
        <div v-if="title" class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>

          <button
            aria-label="Close"
            class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
            @click="close"
          >
            ✕
          </button>
        </div>

        <div class="modal-body">
          <slot :close="close"></slot>
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot :close="close" name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFlyonModal } from "@/composables/useFlyonModal";
import { nextTick, onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
  id: string;
  title?: string;
}>();

const overlayRef = ref<HTMLElement | null>(null);
const { open, close, getInstance } = useFlyonModal(overlayRef);

// Defensive cleanup if FlyonUI leaves a transparent backdrop after closing
const cleanupAfterClose = async () => {
  await nextTick();
  const run = () => {
    // Consider overlays "open" if they are visible (not hidden)
    const anyVisible = document.querySelector('.overlay:not(.hidden)');
    if (!anyVisible) {
      document.querySelectorAll<HTMLElement>('.overlay-backdrop').forEach((el) => el.remove());
      document.documentElement.classList.remove('overlay-open', 'modal-open');
      document.body.classList.remove('overlay-open', 'modal-open');
    }
  };
  run();
  // Run once more after a short delay to catch animation-end cleanup
  setTimeout(run, 150);
};

let attachTimer: any = null;

onMounted(() => {
  try {
    const inst: any = getInstance();
    inst?.on?.("close", () => cleanupAfterClose());
  } catch {
    /* no-op */
  }

  // Instances are often created lazily by FlyonUI on first open.
  // Poll briefly to attach the 'close' listener once the instance exists.
  attachTimer = setInterval(() => {
    try {
      const inst: any = getInstance();
      if (inst && typeof inst.on === "function") {
        inst.on("close", () => cleanupAfterClose());
        clearInterval(attachTimer);
        attachTimer = null;
      }
    } catch {
      /* ignore */
    }
  }, 300);
});

onBeforeUnmount(() => {
  // Ensure nothing blocks clicks if component is removed while backdrop exists
  cleanupAfterClose();
  if (attachTimer) {
    clearInterval(attachTimer);
    attachTimer = null;
  }
});

defineExpose({ open, close });
</script>
