<template>
  <div>
    <TripsTripDetailOptionsUx v-if="isTripOptionsUxEnabled" />
    <TripsTripDetailLegacy v-else />
  </div>
</template>

<script setup lang="ts">
import {useFeatureFlags} from "~/composables/useFeatureFlags";

const { isTripOptionsUxEnabled } = useFeatureFlags()
</script>
