<template>
  <div
    :id="id"
    :class="[
      'overlay modal hidden',
      'overlay-open:opacity-100 overlay-open:duration-300',
      'overlay-backdrop-open:bg-primary/30',
      backdropClass,
    ]"
    role="dialog"
    tabindex="-1"
    v-bind="!keyboard ? { 'data-overlay-keyboard': 'false' } : {}"
  >
    <div :class="['modal-dialog', sizeClass]">
      <div class="modal-content">
        <div v-if="title" class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>

          <button
            :data-overlay="'#' + id"
            aria-label="Close"
            class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
          >
            ✕
          </button>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot :close="close" :data-overlay="'#car-rental-modal'" name="footer"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  id: String,
  title: String,
  size: { type: String, default: "md" },
  backdrop: { type: [String, Boolean, null], default: null },
  keyboard: { type: Boolean, default: true },
});

const open = () => {
  window.HSOverlay?.open(`#${props.id}`);

  // Rebind close buttons **inside this modal**
  requestAnimationFrame(() => {
    window.HSStaticMethods?.autoInit?.();
    window.HSOverlay?.autoInit?.();
  });
};

const close = () => {
  window.HSOverlay?.close(`#${props.id}`);
};

defineExpose({ open, close });

const sizeClass = computed(
  () =>
    ({
      sm: "modal-dialog-sm",
      lg: "modal-dialog-lg",
      xl: "modal-dialog-xl",
      full: "modal-dialog-full",
    })[props.size] ?? "modal-dialog-md",
);

const backdropClass = computed(() =>
  props.backdrop === "static" ? "[--overlay-backdrop:static]" : null,
);
</script>
