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
      class="absolute inset-0 bg-linear-to-t from-5% from-gray-900/80 to-75% to-transparent z-[1]"
    ></div>

    <!-- Image Credit -->
    <NuxtLink
      :to="images[currentIndex]?.unsplashUrl"
      class="saturate-200 contrast-200 absolute bottom-4 right-6 z-[2] text-[10px] text-white/40 hover:text-white/60 transition-colors font-medium tracking-wider uppercase no-underline"
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
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=626&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Shifaaz shamoon",
    unsplashUrl:
      "https://unsplash.com/photos/aerial-photo-of-seashore-sLAk1guBG90",
  },
  {
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1575&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Qingbao Meng",
    unsplashUrl:
      "https://unsplash.com/photos/birds-eye-view-photograph-of-green-mountains-01_igFr7hd4",
  },
  {
    url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Mark Basarab",
    unsplashUrl: "https://unsplash.com/photos/blue-starry-night-1OtUkD_8svc",
  },
  {
    url: "https://images.unsplash.com/photo-1499980762202-04245017d5bf?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Linus Nylund",
    unsplashUrl:
      "https://unsplash.com/photos/white-starfish-on-sand-underwater-during-daytime-UCIZh0-OYPw",
  },
  {
    url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Vincent van Zalinge",
    unsplashUrl:
      "https://unsplash.com/photos/selective-focus-photography-of-blue-kingfisher-vUNQaTtZeOo",
  },
  {
    url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Andreas Glücklhorn",
    unsplashUrl:
      "https://unsplash.com/photos/birds-eye-view-photography-of-trees-and-body-of-water-mawU2PoJWfU",
  },
  {
    url: "https://images.unsplash.com/photo-1533050487297-09b450131914?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Alex Knight",
    unsplashUrl: "https://unsplash.com/photos/2269y26vM3Y",
  },
  {
    url: "https://images.unsplash.com/photo-1474710820418-dd5406ee35d5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    credit: "Davide Cantelli",
    unsplashUrl:
      "https://unsplash.com/photos/person-standing-in-ice-cave-at-daytime-r0q06hjTgOc",
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
