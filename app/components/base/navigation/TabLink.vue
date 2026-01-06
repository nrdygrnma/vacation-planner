<template>
  <NuxtLink
    :class="[
      'relative pb-1 text-sm font-semibold no-underline',
      isActive
        ? 'text-primary border-b-2 border-primary'
        : 'text-gray-600 hover:text-gray-900 hover:border-b hover:border-gray-300',
    ]"
    :to="to"
  >
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";

const props = defineProps<{
  to: string;
}>();

const route = useRoute();
const isActive = computed(() => route.path === props.to);
</script>
