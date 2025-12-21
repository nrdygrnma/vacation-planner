<template>
  <div>
    <TooltipProvider>
      <UApp>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UApp>
    </TooltipProvider>
  </div>
</template>

<script lang="ts" setup>
import { TooltipProvider } from "reka-ui";
</script>
