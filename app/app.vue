<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <Toaster />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { Toaster } from "vue-sonner";
</script>
