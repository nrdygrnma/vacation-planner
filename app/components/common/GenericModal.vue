<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-base-content/40 backdrop-blur-sm"
      @click="$emit('close')"
    />
  </transition>

  <!-- Modal container -->
  <transition name="scale-fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-base-100 shadow-xl rounded-xl w-full max-w-lg relative overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="px-5 py-4 bg-base-200/60 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-base-content/80">
            {{ title }}
          </h3>

          <button
            class="btn btn-xs btn-ghost btn-circle"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 text-sm text-base-content">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="px-5 py-3 bg-base-100/70 flex justify-end gap-2"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
defineProps<{
  open: boolean;
  title?: string;
}>();

defineEmits(["close"]);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active {
  transition: all .18s cubic-bezier(.22,1,.36,1);
}
.scale-fade-leave-active {
  transition: all .14s ease;
}
.scale-fade-enter-from {
  opacity: 0;
  transform: scale(.95);
}
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(.97);
}
</style>
