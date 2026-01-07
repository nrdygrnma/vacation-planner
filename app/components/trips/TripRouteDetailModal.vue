<template>
  <UModal
    :open="open"
    :title="`Route Details: ${trip.title}`"
    description="Trip Route Details"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Trip Stops & Route</h3>
          <UButton
            color="primary"
            icon="i-lucide-file-text"
            label="Export PDF"
            size="xs"
            @click="exportToPDF"
          />
        </div>

        <div class="max-h-[60vh] overflow-y-auto pr-2">
          <div
            v-if="routeSummary && routeSummary.length > 0"
            class="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-around text-center"
          >
            <div>
              <p
                class="text-[10px] font-bold text-primary-600 uppercase tracking-wider"
              >
                Total Distance
              </p>
              <p class="text-xl font-black text-primary-900">
                {{ formatDistance(totalRouteSummary.distance) }}
              </p>
            </div>
            <div class="w-px h-8 bg-primary-200"></div>
            <div>
              <p
                class="text-[10px] font-bold text-primary-600 uppercase tracking-wider"
              >
                Travel Time
              </p>
              <p class="text-xl font-black text-primary-900">
                {{ formatDuration(totalRouteSummary.duration) }}
              </p>
            </div>
          </div>

          <div class="space-y-0">
            <!-- Start Location -->
            <div v-if="trip.startLat && trip.startLng" class="flex flex-col">
              <div class="flex gap-3">
                <div class="flex flex-col items-center shrink-0">
                  <div
                    class="size-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"
                  >
                    <UIcon class="size-4" name="i-lucide-plane-takeoff" />
                  </div>
                  <div
                    v-if="hasMultiplePoints"
                    class="w-0.5 min-h-[20px] h-full bg-gray-200"
                  ></div>
                </div>
                <div class="pb-4">
                  <p class="text-[10px] font-bold text-green-600 uppercase">
                    Start
                  </p>
                  <h4 class="font-bold text-gray-900 leading-tight">
                    {{ trip.startLocationName || "Origin" }}
                  </h4>
                </div>
              </div>

              <!-- Leg After Start -->
              <div v-if="routeSummary?.[0]" class="flex gap-3 -mt-4 mb-2">
                <div class="w-8 flex justify-center items-center shrink-0">
                  <div class="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div
                  class="flex items-center gap-3 py-1 px-3 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600"
                >
                  <UIcon class="size-3 text-primary-400" name="i-lucide-car" />
                  <span class="font-bold text-gray-900">{{
                    formatDistance(routeSummary[0].distance)
                  }}</span>
                  <span class="text-gray-300">|</span>
                  <span class="font-medium">{{
                    formatDuration(routeSummary[0].duration)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Stops -->
            <div
              v-for="(stop, index) in stopsWithCoordsExcludingStart"
              :key="stop.id"
              class="flex flex-col"
            >
              <div class="flex gap-3">
                <div class="flex flex-col items-center shrink-0">
                  <div
                    :class="
                      stop.type === 'HUB' ? 'bg-primary-600' : 'bg-primary-500'
                    "
                    class="size-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-sm"
                  >
                    <UIcon
                      v-if="stop.type === 'HUB'"
                      class="size-4"
                      name="i-lucide-plane"
                    />
                    <span v-else>{{ getStopIndex(stop) }}</span>
                  </div>
                  <div
                    v-if="shouldShowLineAfter(index)"
                    class="w-0.5 min-h-[20px] h-full bg-gray-200"
                  ></div>
                </div>
                <div class="pb-4 flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-gray-900 leading-tight">
                        {{ stop.name }}
                      </h4>
                      <p class="text-[10px] text-gray-500 mt-0.5">
                        {{
                          stop.startDate
                            ? new Date(stop.startDate).toLocaleDateString()
                            : "-"
                        }}
                        -
                        {{
                          stop.endDate
                            ? new Date(stop.endDate).toLocaleDateString()
                            : "-"
                        }}
                      </p>
                    </div>
                    <div v-if="stop.selectedAccommodation" class="text-right">
                      <div
                        class="flex items-center gap-1 text-primary-600 text-[10px] font-semibold bg-primary-50 px-2 py-0.5 rounded-full"
                      >
                        <UIcon class="size-3" name="i-lucide-bed" />
                        <span class="max-w-[100px] truncate">{{
                          stop.selectedAccommodation.name
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Leg After This Stop -->
              <div v-if="getLegForStop(index)" class="flex gap-3 -mt-4 mb-2">
                <div class="w-8 flex justify-center items-center shrink-0">
                  <div class="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div
                  class="flex items-center gap-3 py-1 px-3 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600"
                >
                  <UIcon class="size-3 text-primary-400" name="i-lucide-car" />
                  <span class="font-bold text-gray-900">{{
                    formatDistance(getLegForStop(index).distance)
                  }}</span>
                  <span class="text-gray-300">|</span>
                  <span class="font-medium">{{
                    formatDuration(getLegForStop(index).duration)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- End Location -->
            <div
              v-if="!isStartAndEndSame && trip.endLat && trip.endLng"
              class="flex flex-col"
            >
              <div class="flex gap-3">
                <div class="flex flex-col items-center shrink-0">
                  <div
                    class="size-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0"
                  >
                    <UIcon class="size-4" name="i-lucide-plane-landing" />
                  </div>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-red-600 uppercase">
                    End
                  </p>
                  <h4 class="font-bold text-gray-900 leading-tight">
                    {{ trip.endLocationName || "Destination" }}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Trip } from "~/types/tripTypes";

const props = defineProps<{
  open: boolean;
  trip: Trip;
  routeSummary?: { distance: number; duration: number }[];
}>();

defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

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
    .sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.order - b.order;
    });
});

const isStartAndEndSame = computed(() => {
  const { startLat, startLng, endLat, endLng } = props.trip;
  if (!startLat || !startLng || !endLat || !endLng) return false;
  return startLat === endLat && startLng === endLng;
});

const totalRouteSummary = computed(() => {
  if (!props.routeSummary || props.routeSummary.length === 0)
    return { distance: 0, duration: 0 };
  return props.routeSummary.reduce(
    (acc, leg) => ({
      distance: acc.distance + leg.distance,
      duration: acc.duration + leg.duration,
    }),
    { distance: 0, duration: 0 },
  );
});

const stopsWithCoordsExcludingStart = computed(() => {
  return stopsWithCoords.value.filter((stop) => {
    if (
      isStartAndEndSame.value &&
      stop.lat === props.trip.startLat &&
      stop.lng === props.trip.startLng
    ) {
      return false;
    }
    // If it's a separate start point, we might want to exclude it if it matches exactly?
    // But usually tripStops are distinct.
    return true;
  });
});

const hasMultiplePoints = computed(() => {
  let count = stopsWithCoordsExcludingStart.value.length;
  if (props.trip.startLat && props.trip.startLng) count++;
  if (!isStartAndEndSame.value && props.trip.endLat && props.trip.endLng)
    count++;
  return count > 1;
});

const getStopIndex = (stop: any) => {
  return stopsWithCoords.value.indexOf(stop) + 1;
};

const getLegForStop = (index: number) => {
  // if we have a start location, the first leg (routeSummary[0]) is between start and stopsWithCoordsExcludingStart[0]
  // subsequent legs are between stops.
  const offset = props.trip.startLat && props.trip.startLng ? 1 : 0;
  return props.routeSummary?.[index + offset];
};

const shouldShowLineAfter = (index: number) => {
  if (index < stopsWithCoordsExcludingStart.value.length - 1) return true;
  if (!isStartAndEndSame.value && props.trip.endLat && props.trip.endLng)
    return true;
  return false;
};

const formatDistance = (m: number) => {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
};

const formatDuration = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const exportToPDF = async () => {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("p", "mm", "a4");
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addHeader = (
    doc: any,
    title: string,
    subtitle = "Trip Route Details",
  ) => {
    const primaryColor = [51, 122, 183]; // #337ab7
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, margin, 26);

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 28, pageWidth - margin, 28);
  };

  const addFooter = (doc: any) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        margin,
        pageHeight - 10,
      );
      doc.text("Vacation Planner", pageWidth - margin, pageHeight - 10, {
        align: "right",
      });
    }
  };

  addHeader(doc, props.trip.title);

  const tableData: any[][] = [];

  // Start Location
  if (props.trip.startLat && props.trip.startLng) {
    tableData.push([
      "Start",
      props.trip.startLocationName || "Origin",
      props.trip.startDate
        ? new Date(props.trip.startDate).toLocaleDateString()
        : "-",
      props.trip.startDate
        ? new Date(props.trip.startDate).toLocaleDateString()
        : "-",
      "Origin point",
    ]);

    if (props.routeSummary?.[0]) {
      tableData.push([
        "",
        "Drive",
        formatDistance(props.routeSummary[0].distance),
        formatDuration(props.routeSummary[0].duration),
        "Route to next stop",
      ]);
    }
  }

  // Stops
  stopsWithCoordsExcludingStart.value.forEach((stop, index) => {
    tableData.push([
      getStopIndex(stop),
      stop.name,
      stop.startDate ? new Date(stop.startDate).toLocaleDateString() : "-",
      stop.endDate ? new Date(stop.endDate).toLocaleDateString() : "-",
      stop.selectedAccommodation
        ? `Stay: ${stop.selectedAccommodation.name}`
        : "-",
    ]);

    const leg = getLegForStop(index);
    if (leg) {
      tableData.push([
        "",
        "Drive",
        formatDistance(leg.distance),
        formatDuration(leg.duration),
        "Route to next stop",
      ]);
    }
  });

  // End Location
  if (!isStartAndEndSame.value && props.trip.endLat && props.trip.endLng) {
    tableData.push([
      "End",
      props.trip.endLocationName || "Destination",
      "-",
      props.trip.endDate
        ? new Date(props.trip.endDate).toLocaleDateString()
        : "-",
      "Destination point",
    ]);
  }

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "#",
        "Location / Route",
        "Arrival / Distance",
        "Departure / Duration",
        "Details",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [51, 122, 183] }, // primary-500 approx
    didParseCell: (data) => {
      if (data.row.cells[1].text[0] === "Drive") {
        data.cell.styles.fontStyle = "italic";
        data.cell.styles.textColor = [100, 100, 100];
        data.cell.styles.fontSize = 9;
      }
    },
  });

  if (totalRouteSummary.value.distance > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.setTextColor(51, 122, 183);
    doc.setFont("helvetica", "bold");
    doc.text("Route Totals", 14, finalY + 15);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Distance: ${formatDistance(totalRouteSummary.value.distance)}`,
      14,
      finalY + 22,
    );
    doc.text(
      `Total Estimated Travel Time: ${formatDuration(totalRouteSummary.value.duration)}`,
      14,
      finalY + 27,
    );
  }

  addFooter(doc);
  doc.save(`trip-itinerary-${props.trip.id}.pdf`);
};
</script>
