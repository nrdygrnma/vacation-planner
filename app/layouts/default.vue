<template>
  <div class="max-w-5xl mx-auto px-4 pt-4 pb-16">
    <NavBar />

    <div class="mt-8">
      <slot />
    </div>

    <!-- Global toast container -->
    <Toaster position="bottom-right" rich-colors />
  </div>
</template>

<script lang="ts" setup>
import NavBar from "~/components/base/navigation/NavBar.vue";
import { Toaster } from "vue-sonner";
</script>
