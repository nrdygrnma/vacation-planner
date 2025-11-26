<template>
  <button
    :aria-controls="id"
    :data-overlay="`#${id}`"
    aria-haspopup="dialog"
    class="btn btn-primary btn-sm inline-flex items-center gap-2"
    type="button"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
defineProps<{ id: string }>();
</script>
