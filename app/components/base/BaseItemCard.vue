<template>
  <div
    :class="[
      'border rounded-md p-3 flex gap-3 items-start bg-white',
      selectable ? 'cursor-pointer' : '',
      selected ? 'ring-1 ring-primary/40' : '',
      disabled ? 'opacity-60 pointer-events-none' : '',
    ]"
    role="group"
    tabindex="0"
    @click="onClick"
    @keydown.enter.prevent="onClick"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 min-w-0">
        <slot name="title" />
      </div>
      <div class="text-xs text-muted mt-0.5 min-w-0">
        <slot name="subtitle" />
      </div>
      <div class="text-xs text-gray-500 mt-1 min-w-0">
        <slot name="meta" />
      </div>
      <slot />
    </div>
    <div class="ms-auto shrink-0 flex items-center gap-2">
      <slot name="trailing" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    selectable?: boolean;
    selected?: boolean;
    disabled?: boolean;
  }>(),
  {
    selectable: false,
    selected: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

function onClick() {
  if (props.disabled) return;
  if (props.selectable) emit("click");
}
</script>
