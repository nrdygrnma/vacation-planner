<template>
  <button
      :aria-controls="id"
      :class="['btn', 'btn-sm', ...(buttonClasses || [])]"
      :data-overlay="`#${id}`"
      aria-expanded="false"
      aria-haspopup="dialog"
      type="button"
      @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  id: string;
  buttonClasses?: string[];
}>();

defineEmits<{ (e: 'click'): void }>();
</script>