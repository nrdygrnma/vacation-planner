<template>
  <div>
    <TripDetailOptionsUx v-if="isTripOptionsUxEnabled" />
    <TripDetailLegacy v-else />
  </div>
</template>

<script lang="ts" setup>
import {useFeatureFlags} from "~/composables/useFeatureFlags";
import TripDetailOptionsUx from "~/components/trips/details/TripDetailOptionsUx.vue";
import TripDetailLegacy from "~/components/trips/details/TripDetailLegacy.vue";

const { isTripOptionsUxEnabled } = useFeatureFlags()
</script>
