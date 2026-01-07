<template>
  <div
    v-if="total === 0"
    class="relative py-48 px-6 overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl"
  >
    <!-- Background Slideshow -->
    <div class="absolute inset-0 z-0">
      <TransitionGroup name="fade">
        <div
          v-for="(img, index) in images"
          v-show="currentIndex === index"
          :key="img.url"
          class="absolute inset-0"
        >
          <img
            :src="img.url"
            alt="Dream Destination"
            class="w-full h-full object-cover opacity-60 scale-105"
          />
        </div>
      </TransitionGroup>
    </div>

    <!-- Gradient Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-[1]"
    ></div>

    <!-- Image Credit -->
    <NuxtLink
      :to="images[currentIndex]?.unsplashUrl"
      class="absolute bottom-4 right-6 z-[2] text-[10px] text-white/40 hover:text-white/60 transition-colors font-medium tracking-wider uppercase no-underline"
      target="_blank"
    >
      Photo by {{ images[currentIndex]?.credit }}
    </NuxtLink>

    <div class="relative z-10 max-w-2xl mx-auto text-center space-y-8">
      <div class="space-y-4">
        <h2
          class="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-lg"
        >
          Adventure Awaits
        </h2>
        <p
          class="text-lg md:text-xl text-gray-200 font-medium leading-relaxed drop-shadow"
        >
          Stop dreaming and start planning. Trippy helps you organize every
          detail of your journey, from flights and stays to daily memories.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <UButton
          class="rounded-full px-8 shadow-lg shadow-primary/20"
          color="primary"
          icon="i-lucide-plus"
          label="Create Your First Trip"
          size="xl"
          @click="$emit('open-create')"
        />
        <UButton
          class="rounded-full px-8 backdrop-blur-md bg-white/10 text-white hover:bg-white/20 border-white/20"
          color="neutral"
          icon="i-lucide-book-open"
          label="See How It Works"
          size="xl"
          to="/docs"
          variant="soft"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="text-gray-500 italic py-10 text-center border-2 border-dashed border-gray-100 rounded-xl"
  >
    <UIcon class="size-10 mb-2 opacity-20" name="i-lucide-search-x" />
    <p>No trips match your search.</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ total: number }>();
defineEmits<{
  (e: "open-create"): void;
}>();

const images = [
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    credit: "Sean Oulashin",
    unsplashUrl: "https://unsplash.com/photos/KMn4VEeEPR8",
  },
  {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
    credit: "Harvey Rodgers",
    unsplashUrl: "https://unsplash.com/photos/8S_97SAn9zI",
  },
  {
    url: "https://images.unsplash.com/photo-1611223157502-18a03c59a4d9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Fabio Fistarol",
    unsplashUrl: "https://unsplash.com/photos/SInqK85uXwM",
  },
  {
    url: "https://images.unsplash.com/photo-1507941097613-9f2157b69235?q=80&w=1243&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Florian Wehde",
    unsplashUrl: "https://unsplash.com/photos/S9h3901nKqY",
  },
  {
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    credit: "Pietro De Grandi",
    unsplashUrl: "https://unsplash.com/photos/T7K4aEGaSzQ",
  },
  {
    url: "https://images.unsplash.com/photo-1592261201285-5b49215bc2e1?q=80&w=1185&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Delphine Beausoleil",
    unsplashUrl: "https://unsplash.com/photos/C4TbeKqS0f0",
  },
  {
    url: "https://images.unsplash.com/photo-1533050487297-09b450131914?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Alex Knight",
    unsplashUrl: "https://unsplash.com/photos/2269y26vM3Y",
  },
];

const currentIndex = ref(0);
let interval: any = null;

onMounted(() => {
  if (props.total === 0) {
    interval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % images.length;
    }, 5000);
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 1.5s ease-in-out,
    transform 5s linear;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(1);
}

.fade-leave-to {
  opacity: 0;
}

/* Subtle zoom effect during the active phase */
img {
  transition: transform 5s linear;
}
</style>
