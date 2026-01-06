<template>
  <NuxtLink
    :class="[
      'relative pb-1 text-sm font-semibold no-underline border-b-2 transition-colors duration-200',
      isActive
        ? 'text-primary border-primary'
        : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300',
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
const isActive = computed(() => {
  if (props.to === "/") {
    return route.path === "/" || route.path.startsWith("/trips");
  }
  return route.path === props.to;
});
</script>
