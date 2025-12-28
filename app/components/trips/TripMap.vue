<template>
  <div
    class="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50"
  >
    <div ref="mapContainer" class="w-full h-full z-0"></div>

    <!-- Empty State / Missing Coords Warning -->
    <div
      v-if="stopsWithCoords.length === 0"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10"
    >
      <UIcon class="size-10 text-gray-400 mb-2" name="i-lucide-map-pin-off" />
      <p class="text-gray-600 font-medium">
        No coordinates provided for trip stops
      </p>
      <p class="text-gray-400 text-sm mt-1">
        Add latitude and longitude to see them on the map
      </p>
    </div>

    <!-- Map Legend / Controls Overlay -->
    <div
      v-else
      class="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-md border border-gray-100 flex flex-col gap-2"
    >
      <div
        v-if="trip.startLat && trip.startLng"
        class="flex items-center gap-2 text-xs font-medium text-gray-700"
      >
        <div
          class="size-3 rounded-full bg-green-500 shadow-sm border-2 border-white"
        ></div>
        <span>Start: {{ trip.startLocationName || "Origin" }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs font-medium text-gray-700">
        <div
          class="size-3 rounded-full bg-primary-500 shadow-sm border-2 border-white"
        ></div>
        <span>Trip Stop</span>
      </div>
      <div
        v-if="trip.endLat && trip.endLng"
        class="flex items-center gap-2 text-xs font-medium text-gray-700"
      >
        <div
          class="size-3 rounded-full bg-red-500 shadow-sm border-2 border-white"
        ></div>
        <span>End: {{ trip.endLocationName || "Destination" }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs font-medium text-gray-700">
        <div class="w-4 h-0.5 bg-primary-400"></div>
        <span>Travel Route</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { Trip } from "~/types/tripTypes";
import "leaflet/dist/leaflet.css";

const props = defineProps<{
  trip: Trip;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let L: any = null;

const stopsWithCoords = computed(() => {
  return props.trip.tripStops
    .filter(
      (stop) =>
        stop.lat !== undefined &&
        stop.lng !== undefined &&
        stop.lat !== null &&
        stop.lng !== null &&
        !(stop.lat === 0 && stop.lng === 0),
    )
    .sort(
      (a, b) =>
        a.order - b.order ||
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
});

const initMap = async () => {
  if (process.server) return;
  if (!mapContainer.value) return;

  // Import Leaflet dynamically to avoid SSR issues
  L = (await import("leaflet")).default;

  // Pre-define custom styles for numbered markers
  const style = document.createElement("style");
  style.innerHTML = `
    .numbered-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #3b82f6;
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);

  // Fix default icon issue in Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  if (map) {
    map.remove();
  }

  const startPoint =
    props.trip.startLat && props.trip.startLng
      ? { lat: props.trip.startLat, lng: props.trip.startLng }
      : null;
  const endPoint =
    props.trip.endLat && props.trip.endLng
      ? { lat: props.trip.endLat, lng: props.trip.endLng }
      : null;

  if (stopsWithCoords.value.length === 0 && !startPoint && !endPoint) return;

  // Initialize map
  map = L.map(mapContainer.value, {
    zoomControl: false,
    scrollWheelZoom: true,
  }).setView([0, 0], 2);

  // Add CartoDB Positron tiles (very clean and modern)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    },
  ).addTo(map);

  // Add zoom control to top-right
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);

  const markers: any[] = [];
  const latLngs: [number, number][] = [];

  // Add start point
  if (startPoint && (startPoint.lat !== 0 || startPoint.lng !== 0)) {
    const lat = startPoint.lat!;
    const lng = startPoint.lng!;
    latLngs.push([lat, lng]);

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="flex items-center justify-center size-8 bg-green-500 border-3 border-white rounded-full shadow-lg text-white">
            <i class="i-lucide-home size-4"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }).addTo(map);

    marker.bindPopup(
      `
      <div class="p-3 min-w-[150px]">
        <div class="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Trip Start</div>
        <h3 class="font-bold text-gray-900 text-sm leading-tight">${
          props.trip.startLocationName || "Origin"
        }</h3>
      </div>
    `,
      { className: "custom-map-popup", closeButton: false },
    );
  }

  stopsWithCoords.value.forEach((stop, index) => {
    const lat = stop.lat!;
    const lng = stop.lng!;
    if (lat === 0 && lng === 0) return; // Skip 0,0 (India)
    latLngs.push([lat, lng]);

    // Create custom numbered marker
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: stop.type === "HUB" ? "" : "numbered-marker",
        html:
          stop.type === "HUB"
            ? `<div class="flex items-center justify-center size-8 bg-primary-600 border-3 border-white rounded-full shadow-lg text-white">
               <i class="${index === 0 ? "i-lucide-plane-takeoff" : index === stopsWithCoords.value.length - 1 ? "i-lucide-plane-landing" : "i-lucide-navigation"} size-4"></i>
             </div>`
            : `<span>${index + 1}</span>`,
        iconSize: stop.type === "HUB" ? [32, 32] : [28, 28],
        iconAnchor: stop.type === "HUB" ? [16, 16] : [14, 14],
      }),
    }).addTo(map);

    // Add labels/popups
    const startDate = new Date(stop.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const endDate = new Date(stop.endDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const popupContent = `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center gap-2 mb-2">
          ${
            stop.type === "HUB"
              ? `<div class="size-6 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-sm">
                 <i class="i-lucide-plane size-3"></i>
               </div>`
              : `<div class="size-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                 ${index + 1}
               </div>`
          }
          <div>
            <h3 class="font-bold text-gray-900 leading-tight">${stop.name}${stop.type === "HUB" ? ' <span class="text-[9px] uppercase bg-primary-100 text-primary-700 px-1 rounded">Hub</span>' : ""}</h3>
            <p class="text-[10px] text-gray-500 font-medium">${startDate} - ${endDate}</p>
          </div>
        </div>
        
        ${
          stop.type === "STOP" && stop.selectedAccommodation
            ? `
          <div class="mt-3 p-2 bg-primary-50 rounded-lg border border-primary-100">
            <div class="flex items-center gap-2 text-[11px] text-primary-700 font-bold mb-1">
              <i class="i-lucide-bed size-3.5"></i>
              <span>Stay</span>
            </div>
            <p class="text-xs text-primary-900 font-medium truncate">${stop.selectedAccommodation.name}</p>
          </div>
        `
            : stop.type === "STOP"
              ? `
          <div class="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-100 border-dashed text-center">
             <p class="text-[10px] text-gray-400 font-medium italic">No accommodation selected</p>
          </div>
        `
              : ""
        }
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: "custom-map-popup",
      closeButton: false,
      offset: [0, -5],
    });

    markers.push(marker);
  });

  // Add end point
  if (endPoint && (endPoint.lat !== 0 || endPoint.lng !== 0)) {
    const lat = endPoint.lat!;
    const lng = endPoint.lng!;
    latLngs.push([lat, lng]);

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="flex items-center justify-center size-8 bg-red-500 border-3 border-white rounded-full shadow-lg text-white">
            <i class="i-lucide-flag size-4"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }).addTo(map);

    marker.bindPopup(
      `
      <div class="p-3 min-w-[150px]">
        <div class="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Trip End</div>
        <h3 class="font-bold text-gray-900 text-sm leading-tight">${
          props.trip.endLocationName || "Destination"
        }</h3>
      </div>
    `,
      { className: "custom-map-popup", closeButton: false },
    );
  }

  // Draw travel route
  if (latLngs.length > 1) {
    L.polyline(latLngs, {
      color: "#60a5fa", // primary-400
      weight: 4,
      opacity: 0.6,
      dashArray: "8, 8",
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
  }

  // Fit bounds to show all markers
  if (latLngs.length > 0) {
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});

watch(
  () => props.trip.tripStops,
  () => {
    initMap();
  },
  { deep: true },
);
</script>

<style scoped>
@reference "../../assets/css/main.css";

/* Custom Leaflet Popup Styling */
:deep(.custom-map-popup .leaflet-popup-content-wrapper) {
  @apply rounded-lg shadow-xl border border-gray-100 p-0 overflow-hidden;
}

:deep(.custom-map-popup .leaflet-popup-content) {
  @apply m-0;
}

:deep(.custom-map-popup .leaflet-popup-tip) {
  @apply shadow-none border-b border-r border-gray-100;
}

:deep(.leaflet-container) {
  @apply font-sans;
}
</style>
