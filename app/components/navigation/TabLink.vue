<template>
  <NuxtLink
    :class="{
      'text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:bg-primary':
        isActive,
      'hover:after:absolute hover:after:-bottom-1.5 hover:after:left-0 hover:after:h-0.5 hover:after:w-full hover:after:bg-base-content/50':
        !isActive,
    }"
    :to="to"
    class="tab relative pb-1 text-sm font-semibold"
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
