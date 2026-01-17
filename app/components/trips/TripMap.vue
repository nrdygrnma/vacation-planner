<template>
  <div
    :class="[
      'relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 transition-all duration-300',
      !isFullscreen ? 'h-[500px]' : '',
    ]"
  >
    <Teleport :disabled="!isFullscreen" to="#teleports">
      <div
        :class="[
          isFullscreen
            ? 'fixed inset-0 z-[100] w-screen h-screen bg-white'
            : 'w-full h-full relative',
        ]"
      >
        <div ref="mapContainer" class="w-full h-full z-0"></div>

        <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <UButton
            :icon="isFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
            class="shadow-md"
            color="neutral"
            size="sm"
            variant="outline"
            @click="toggleFullscreen"
          />
          <UButton
            class="shadow-md"
            color="neutral"
            icon="i-lucide-list"
            size="sm"
            variant="outline"
            @click="isListOpen = true"
          />
        </div>

        <!-- Trip Stops List Modal -->
        <TripRouteDetailModal
          v-model:open="isListOpen"
          :route-summary="routeSummary"
          :trip="trip"
        />

        <!-- Empty State / Missing Coords Warning -->
        <div
          v-if="!hasAnyCoords"
          class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10"
        >
          <UIcon class="size-10 text-gray-400 mb-2" name="lucide:map-pin-off" />
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
              class="size-4 rounded-full rounded-bl-none rotate-[-45deg] bg-green-500 shadow-sm border-2 border-white flex items-center justify-center text-white"
            >
              <div class="rotate-[45deg] flex items-center justify-center">
                <UIcon class="size-2" name="lucide:plane-takeoff" />
              </div>
            </div>
            <span>Start: {{ trip.startLocationName || "Origin" }}</span>
          </div>

          <div
            class="flex items-center gap-2 text-xs font-medium text-gray-700"
          >
            <div
              class="size-4 rounded-full rounded-bl-none rotate-[-45deg] bg-primary-500 shadow-sm border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
            >
              <div class="rotate-[45deg]">1</div>
            </div>
            <span>Trip Stop</span>
          </div>

          <div
            v-if="trip.endLat && trip.endLng && !isStartAndEndSame"
            class="flex items-center gap-2 text-xs font-medium text-gray-700"
          >
            <div
              class="size-4 rounded-full rounded-bl-none rotate-[-45deg] bg-red-500 shadow-sm border-2 border-white flex items-center justify-center text-white"
            >
              <div class="rotate-[45deg] flex items-center justify-center">
                <UIcon class="size-2" name="lucide:plane-landing" />
              </div>
            </div>
            <span>End: {{ trip.endLocationName || "Destination" }}</span>
          </div>

          <div
            v-if="isStartAndEndSame"
            class="flex items-center gap-2 text-xs font-medium text-gray-700"
          >
            <div
              class="size-4 rounded-full rounded-bl-none rotate-[-45deg] bg-primary-600 shadow-sm border-2 border-white flex items-center justify-center text-white"
            >
              <div class="rotate-[45deg] flex items-center justify-center">
                <UIcon class="size-2" name="lucide:plane" />
              </div>
            </div>
            <span>Hub (Start & End)</span>
          </div>

          <div
            class="flex items-center gap-2 text-xs font-medium text-gray-700"
          >
            <div class="w-4 h-[3px] bg-primary-400"></div>
            <span>Travel Route</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { onKeyStroke } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { Trip } from "~/types/tripTypes";
import { renderToString } from "@vue/server-renderer";
import MapPopup from "~/components/trips/MapPopup.vue";
import TripRouteDetailModal from "~/components/trips/TripRouteDetailModal.vue";

if (import.meta.client) {
  import("leaflet/dist/leaflet.css");
  import("leaflet-routing-machine/dist/leaflet-routing-machine.css");
}

const props = defineProps<{ trip: Trip }>();

onKeyStroke("Escape", () => {
  if (isFullscreen.value) toggleFullscreen();
});

const mapContainer = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const isListOpen = ref(false);
const routeSummary = ref<{ distance: number; duration: number }[]>([]);
let map: any = null;
let L: any = null;

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value;
  await nextTick();
  if (map) map.invalidateSize();
};

const stopsWithCoords = computed(() =>
  props.trip.tripStops
    .filter(
      (stop) =>
        stop.lat != null &&
        stop.lng != null &&
        !(stop.lat === 0 && stop.lng === 0),
    )
    .sort(
      (a, b) =>
        a.order - b.order ||
        (a.startDate && b.startDate
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : 0),
    ),
);

// Show map even if only trip start/end exists (no stops)
const hasAnyCoords = computed(() => {
  const hasTripStart =
    props.trip.startLat != null && props.trip.startLng != null;
  const hasTripEnd = props.trip.endLat != null && props.trip.endLng != null;
  return hasTripStart || hasTripEnd || stopsWithCoords.value.length > 0;
});

const isStartAndEndSame = computed(() => {
  const { startLat, startLng, endLat, endLng } = props.trip;
  if (!startLat || !startLng || !endLat || !endLng) return false;
  return startLat === endLat && startLng === endLng;
});

const sameLatLng = (
  aLat?: number,
  aLng?: number,
  bLat?: number,
  bLng?: number,
) =>
  aLat != null &&
  aLng != null &&
  bLat != null &&
  bLng != null &&
  aLat === bLat &&
  aLng === bLng;

const initMap = async () => {
  if (import.meta.server) return;
  if (!mapContainer.value) return;

  L = (await import("leaflet")).default;
  const { default: routingMachine } = await import(
    "leaflet-routing-machine" as any
  );

  // Custom styles
  const style = document.createElement("style");
  style.innerHTML = `
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .pin-body {
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .pin-content {
      transform: rotate(45deg);
      color: white;
      font-weight: bold;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-map-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; }
    .custom-map-popup .leaflet-popup-content { margin: 0; width: auto !important; }
    .custom-map-popup .leaflet-popup-tip-container { display: none; }
  `;
  document.head.appendChild(style);

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  if (map) map.remove();

  map = L.map(mapContainer.value, {
    zoomControl: false,
    scrollWheelZoom: true,
  }).setView([0, 0], 2);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    },
  ).addTo(map);

  L.control.zoom({ position: "topright" }).addTo(map);

  const latLngs: [number, number][] = [];

  // Normalize coordinates: accept numbers/strings, convert microdegrees, filter invalid
  const normalizeLatLng = (lat: any, lng: any): [number, number] | null => {
    let la = Number(lat);
    let ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
    // Convert microdegrees like -84204460 -> -84.20446
    if (
      (Math.abs(la) > 90 || Math.abs(ln) > 180) &&
      Math.abs(la) <= 90_000_000 &&
      Math.abs(ln) <= 180_000_000
    ) {
      la = la / 1_000_000;
      ln = ln / 1_000_000;
    }
    if (Math.abs(la) > 90 || Math.abs(ln) > 180) return null;
    return [la, ln];
  };

  // MARKERS (START / STOPS / END)
  const allStops = stopsWithCoords.value;
  let markerCount = 0;

  // Helper to add marker with popup
  const addMarker = async (
    stop: any,
    index: number,
    lat: number,
    lng: number,
    type: "START" | "STOP" | "END" | "HUB",
  ) => {
    const norm = normalizeLatLng(lat, lng);
    if (norm) latLngs.push(norm);
    const totalStops =
      (props.trip.startLat != null && props.trip.startLng != null ? 1 : 0) +
      allStops.filter(
        (s) =>
          !(
            isStartAndEndSame.value &&
            sameLatLng(
              s.lat,
              s.lng,
              props.trip.startLat ?? undefined,
              props.trip.startLng ?? undefined,
            )
          ),
      ).length +
      (!isStartAndEndSame.value &&
      props.trip.endLat != null &&
      props.trip.endLng != null
        ? 1
        : 0);

    const popupHtml = await renderToString(
      h(MapPopup, {
        stop,
        index,
        totalStops,
      }),
    );

    const { leafletIcon } = await import("~/utils/leafletIcon");
    let markerHtml = "";
    let bgColor = "bg-primary-500";

    if (type === "START") {
      markerHtml = leafletIcon("lucide:plane-takeoff", 16, "white");
      bgColor = "bg-green-500";
    } else if (type === "END") {
      markerHtml = leafletIcon("lucide:plane-landing", 16, "white");
      bgColor = "bg-red-500";
    } else if (type === "HUB") {
      markerHtml = leafletIcon("lucide:plane", 16, "white");
      bgColor = "bg-primary-600";
    } else {
      markerHtml = `<span>${index + 1}</span>`;
      bgColor = "bg-primary-500";
    }

    const markerPos = norm ?? [lat, lng];
    const marker = L.marker(markerPos, {
      icon: L.divIcon({
        html: `
          <div class="custom-pin">
            <div class="pin-body ${bgColor}">
              <div class="pin-content">
                ${markerHtml}
              </div>
            </div>
          </div>
        `,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    }).addTo(map);
    marker.bindPopup(popupHtml, {
      className: "custom-map-popup",
      closeButton: false,
    });
    markerCount++;
  };

  // Start marker
  if (props.trip.startLat != null && props.trip.startLng != null) {
    if (isStartAndEndSame.value) {
      await addMarker(
        props.trip,
        markerCount,
        props.trip.startLat,
        props.trip.startLng,
        "HUB",
      );
    } else {
      await addMarker(
        props.trip,
        markerCount,
        props.trip.startLat,
        props.trip.startLng,
        "START",
      );
    }
  }

  // Stops
  for (let i = 0; i < allStops.length; i++) {
    const stop = allStops[i];
    if (!stop) continue;
    if (
      isStartAndEndSame.value &&
      sameLatLng(
        stop.lat,
        stop.lng,
        props.trip.startLat ?? undefined,
        props.trip.startLng ?? undefined,
      )
    )
      continue;
    if (stop.lat != null && stop.lng != null) {
      await addMarker(stop, markerCount, stop.lat, stop.lng, stop.type);
    }
  }

  // End marker
  if (
    !isStartAndEndSame.value &&
    props.trip.endLat != null &&
    props.trip.endLng != null
  ) {
    await addMarker(
      props.trip,
      markerCount,
      props.trip.endLat,
      props.trip.endLng,
      "END",
    );
  }

  // ROUTING
  if (latLngs.length > 1) {
    const waypoints = latLngs.map((ll) => L.latLng(ll[0], ll[1]));
    const routing = L.Routing.control({
      waypoints,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      lineOptions: { styles: [{ color: "#3b82f6", opacity: 0.8, weight: 4 }] },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    routing.on("routesfound", (e: any) => {
      const route = e.routes[0];
      if (!route) return;
      const legs: { distance: number; duration: number }[] = [];
      if (route.instructions && route.waypointIndices?.length > 1) {
        let curDist = 0,
          curTime = 0,
          wpIdx = 0;
        for (let instr of route.instructions) {
          if (
            wpIdx + 1 < route.waypointIndices.length &&
            instr.index >= route.waypointIndices[wpIdx + 1]
          ) {
            legs.push({ distance: curDist, duration: curTime });
            curDist = curTime = 0;
            wpIdx++;
          }
          curDist += instr.distance || 0;
          curTime += instr.time || 0;
        }
        legs.push({ distance: curDist, duration: curTime });
      }
      if (legs.length === 0)
        legs.push({
          distance: route.summary.totalDistance,
          duration: route.summary.totalTime,
        });
      routeSummary.value = legs;
    });

    const container = routing.getContainer();
    if (container) container.style.display = "none";
  }

  // Safely adjust viewport depending on number of valid points
  if (latLngs.length === 1) {
    map.setView(L.latLng(latLngs[0][0], latLngs[0][1]), 10);
  } else if (latLngs.length > 1) {
    map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 12 });
  }
};

onMounted(initMap);
onUnmounted(() => map && map.remove());
watch(() => props.trip, initMap, { deep: true });
</script>
