<template>
  <div class="text-base-content/60 italic">
    <span v-if="total === 0">No trips yet. Create your first trip.</span>
    <span v-else>No trips match your search.</span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ total: number }>();
</script>
