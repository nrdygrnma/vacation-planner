<template>
  <div
    class="flex flex-col items-center justify-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/60 dark:bg-gray-900/40 text-sm text-gray-500 dark:text-gray-400"
  >
    <span v-if="total === 0"> No trips yet. Create your first trip. </span>
    <span v-else> No trips match your search. </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ total: number }>();
</script>
