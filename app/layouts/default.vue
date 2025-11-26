<template>
  <div class="container mx-auto pt-4 pb-16">
    <NavBar />

    <div class="px-6 mt-8">
      <slot />
    </div>

    <!-- Global toast container -->
    <Toaster position="bottom-right" rich-colors />
  </div>
</template>

<script lang="ts" setup>
import NavBar from "~/components/navigation/NavBar.vue";
import { Toaster } from "vue-sonner";
</script>
