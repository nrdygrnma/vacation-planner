<template>
  <div class="container mx-auto pb-16">
    <NavBar />

    <div class="mt-8">
      <slot />
    </div>

    <Toaster position="bottom-right" rich-colors />
  </div>
</template>

<script lang="ts" setup>
import NavBar from "~/components/common/navigation/NavBar.vue";
import { Toaster } from "vue-sonner";
</script>
