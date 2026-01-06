<template>
  <TooltipProvider>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <div id="teleports" class="relative z-[100]" />
    </UApp>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from "reka-ui";
</script>
