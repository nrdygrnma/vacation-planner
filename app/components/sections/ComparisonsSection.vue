<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-layers" />
        Trip Comparisons
      </h3>
      <div class="flex items-center gap-2">
        <UButton
          v-if="snapshots?.length"
          color="info"
          icon="i-lucide-brain-circuit"
          label="Analyze"
          size="sm"
          variant="solid"
          @click="showReasoning = true"
        />
        <UButton
          color="neutral"
          icon="i-lucide-share"
          label="Export Selection"
          size="sm"
          variant="outline"
          @click="exportSelectionToPDF"
        />
        <UButton
          v-if="snapshots?.length"
          color="neutral"
          icon="i-lucide-file-text"
          label="Export Comparison"
          size="sm"
          variant="outline"
          @click="exportToPDF"
        />
        <UButton
          color="primary"
          icon="i-lucide-camera"
          label="Create Snapshot"
          size="sm"
          @click="isCreateOpen = true"
        />
      </div>
    </div>

    <div v-if="snapshotsPending" class="text-center py-10">
      <UIcon
        class="size-8 animate-spin text-primary"
        name="i-lucide-loader-2"
      />
      <p class="mt-2 text-gray-500 text-sm">Loading comparisons...</p>
    </div>

    <ComparisonEmptyState
      v-else-if="!snapshots?.length"
      :people="trip.people"
      :total="calculateCurrentTotal()"
    />

    <div v-else class="space-y-6">
      <ComparisonAnalysisModal
        v-model:open="showReasoning"
        :analysis="analysis"
        :people="trip.people"
      />

      <ComparisonTable
        :snapshots="snapshots"
        :trip="trip"
        :trip-stops="tripStops"
        @delete-snapshot="deleteSnapshot"
      />
    </div>
    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :title="deleteTitle"
      description="This comparison snapshot will be permanently removed."
      @confirm="confirmDelete"
    />

    <!-- Create Snapshot Modal -->
    <ComparisonSnapshotModal
      v-model:open="isCreateOpen"
      :initial-name="generatedName"
      @submit="createSnapshot"
    />
  </div>
</template>

<script lang="ts" setup>
import { type AccommodationOption, travelClassLabels, type Trip } from "@/types/tripTypes";
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";
import { useTripStopsStore } from "~/stores/tripStops";
import { toast } from "vue-sonner";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import ComparisonAnalysisModal from "~/components/sections/comparisons/ComparisonAnalysisModal.vue";
import ComparisonSnapshotModal from "~/components/sections/comparisons/ComparisonSnapshotModal.vue";
import ComparisonEmptyState from "~/components/sections/comparisons/ComparisonEmptyState.vue";
import ComparisonTable from "~/components/sections/comparisons/ComparisonTable.vue";

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const { formatEUR, convertToEUR } = useCurrencyUtils();
const stopsStore = useTripStopsStore();

// UI State
const showReasoning = ref(false);
const isCreateOpen = ref(false);

// Delete Snapshot state
const isDeleteOpen = ref(false);
const deleting = ref(false);
const snapshotToDeleteId = ref<string | null>(null);

const exportSelectionToPDF = async () => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const addHeader = (
    doc: any,
    title: string,
    subtitle = "Trip Summary & Info Sheet",
  ) => {
    // Primary color for the theme
    const primaryColor = [51, 122, 183]; // #337ab7
    const pageWidth = doc.internal.pageSize.getWidth();

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

  const addSectionTitle = (
    doc: any,
    title: string,
    y: number,
    icon?: string,
  ) => {
    const primaryColor = [51, 122, 183];
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);

    return y + 10;
  };

  const addLabelValue = (
    doc: any,
    label: string,
    value: string,
    x: number,
    y: number,
    width = 80,
  ) => {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), x, y);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");

    if (value && value.startsWith("http")) {
      doc.setTextColor(51, 122, 183);
      doc.text("Click to open link", x, y + 5);
      doc.link(x, y + 2, 40, 5, { url: value });
      doc.setTextColor(0);
    } else {
      const textLines = doc.splitTextToSize(value || "—", width);
      doc.text(textLines, x, y + 5);
      return (textLines.length - 1) * 5 + 5;
    }
    return 5;
  };

  const addFooter = (doc: any) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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

  const addImageToDoc = async (
    url: string,
    x: number,
    y: number,
    maxW = 60,
    maxH = 40,
    mode: "cover" | "contain" = "cover",
  ) => {
    try {
      // Use proxy to avoid CORS issues for external images
      const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;

      const img = new Image();
      img.crossOrigin = "Anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = proxyUrl;
      });

      const canvas = document.createElement("canvas");
      // Use higher resolution for better PDF quality
      canvas.width = maxW * 10;
      canvas.height = maxH * 10;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        if (mode === "cover") {
          const targetRatio = maxW / maxH;
          const imgRatio = img.width / img.height;
          let sourceX = 0;
          let sourceY = 0;
          let sourceW = img.width;
          let sourceH = img.height;

          if (imgRatio > targetRatio) {
            // Image is wider than container
            sourceW = img.height * targetRatio;
            sourceX = (img.width - sourceW) / 2;
          } else {
            // Image is taller than container
            sourceH = img.width / targetRatio;
            sourceY = (img.height - sourceH) / 2;
          }

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceW,
            sourceH,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        } else {
          // Contain mode - fit whole image without cropping
          const imgRatio = img.width / img.height;
          const targetRatio = maxW / maxH;
          let drawW = canvas.width;
          let drawH = canvas.height;
          let drawX = 0;
          let drawY = 0;

          if (imgRatio > targetRatio) {
            drawH = canvas.width / imgRatio;
            drawY = (canvas.height - drawH) / 2;
          } else {
            drawW = canvas.height * imgRatio;
            drawX = (canvas.width - drawW) / 2;
          }

          // Clear background for contain mode
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      doc.addImage(dataUrl, "JPEG", x, y, maxW, maxH);
      return maxH;
    } catch (e) {
      console.error("Failed to load image for PDF", e);
      return 0;
    }
  };

  addHeader(doc, props.trip.title);
  let currentY = 38;

  // Pre-calculate marker mapping to ensure consistency with the map
  let markerIndex = 1;
  const latLngsForLogic: [number, number][] = [];
  const startMarkerNum =
    props.trip.startLat != null && props.trip.startLng != null
      ? markerIndex++
      : null;
  if (props.trip.startLat != null && props.trip.startLng != null) {
    latLngsForLogic.push([props.trip.startLat, props.trip.startLng]);
  }

  const stopMarkerNums: Record<string, number> = {};
  const stopsWithCoords = tripStops.value
    .filter(
      (stop) =>
        stop.lat != null &&
        stop.lng != null &&
        !(stop.lat === 0 && stop.lng === 0),
    )
    .sort((a, b) => a.order - b.order);

  stopsWithCoords.forEach((stop) => {
    const last = latLngsForLogic[latLngsForLogic.length - 1];
    if (last && last[0] === stop.lat && last[1] === stop.lng) {
      // Same as previous point, reuse marker number
      // Check if it's the start location
      if (
        props.trip.startLat === stop.lat &&
        props.trip.startLng === stop.lng
      ) {
        stopMarkerNums[stop.id] = startMarkerNum || 1;
      } else {
        // Reuse previous stop's number if they are identical coordinates
        // Actually, let's find which stop it was
        const prevStopId = Object.keys(stopMarkerNums).find(
          (id) =>
            tripStops.value.find((s) => s.id === id)?.lat === stop.lat &&
            tripStops.value.find((s) => s.id === id)?.lng === stop.lng,
        );
        stopMarkerNums[stop.id] = prevStopId
          ? stopMarkerNums[prevStopId] || markerIndex - 1
          : markerIndex - 1;
      }
    } else {
      stopMarkerNums[stop.id] = markerIndex++;
      if (stop.lat != null && stop.lng != null) {
        latLngsForLogic.push([stop.lat, stop.lng]);
      }
    }
  });

  const lastLogicPoint = latLngsForLogic[latLngsForLogic.length - 1];
  const endMarkerNum =
    props.trip.endLat != null && props.trip.endLng != null
      ? lastLogicPoint &&
        lastLogicPoint[0] === props.trip.endLat &&
        lastLogicPoint[1] === props.trip.endLng
        ? markerIndex - 1
        : markerIndex
      : null;

  // 1. Flight
  if (props.trip.selectedFlight) {
    const f = props.trip.selectedFlight;
    const title = startMarkerNum
      ? `1. Transportation: Flight`
      : `Transportation: Flight`;
    currentY = addSectionTitle(doc, title, currentY);

    const airline =
      f.airline?.name || (typeof f.airline === "string" ? f.airline : "Flight");
    const from =
      f.fromAirport?.symbol ||
      f.fromAirport?.name ||
      (typeof f.fromAirport === "string" ? f.fromAirport : "—");
    const to =
      f.toAirport?.symbol ||
      f.toAirport?.name ||
      (typeof f.toAirport === "string" ? f.toAirport : "—");
    const depDate = f.departureDate
      ? new Date(f.departureDate).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
    const arrDate = f.arrivalDate
      ? new Date(f.arrivalDate).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

    const col1 = margin;
    const col2 = margin + 60;
    const col3 = margin + 120;

    const travelClass = travelClassLabels[f.travelClass] || f.travelClass;

    addLabelValue(doc, "Route", `${from} -> ${to}`, col1, currentY);
    addLabelValue(doc, "Airline", airline, col2, currentY);
    addLabelValue(doc, "Flight #", f.flightNumber || "—", col3, currentY);
    currentY += 15;

    const stops = f.stops === 0 ? "Non-stop" : `${f.stops} stop(s)`;
    const price = formatEUR(
      getFlightPrice(props.trip.selectedFlightId || null),
    );

    addLabelValue(doc, "Departure", depDate, col1, currentY);
    addLabelValue(doc, "Arrival", arrDate, col2, currentY);
    addLabelValue(doc, "Stops", stops, col3, currentY);
    currentY += 15;

    if (f.isRoundTrip) {
      const retDepDate = f.returnDepartureDate
        ? new Date(f.returnDepartureDate).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—";
      const retArrDate = f.returnArrivalDate
        ? new Date(f.returnArrivalDate).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—";

      addLabelValue(doc, "Return Route", `${to} -> ${from}`, col1, currentY);
      addLabelValue(doc, "Return Dep.", retDepDate, col2, currentY);
      addLabelValue(doc, "Return Arr.", retArrDate, col3, currentY);
      currentY += 15;
    }

    addLabelValue(doc, "Class", travelClass, col1, currentY);
    addLabelValue(doc, "Price", price, col2, currentY);
    if (f.bookingUrl) {
      addLabelValue(doc, "Booking Link", f.bookingUrl, col3, currentY);
    }
    currentY += 15;

    if (f.notes) {
      const h = addLabelValue(
        doc,
        "Notes",
        f.notes,
        col1,
        currentY,
        contentWidth,
      );
      currentY += h + 10;
    } else {
      currentY += 5;
    }
  }

  // 2. Car Rental
  if (props.trip.selectedCarRental) {
    const r = props.trip.selectedCarRental;
    if (currentY > 200) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 38;
    }

    const title = startMarkerNum
      ? `1. Transportation: Car Rental`
      : `Transportation: Car Rental`;
    currentY = addSectionTitle(doc, title, currentY);

    const imageColWidth = 65;
    const detailsX = margin + imageColWidth;
    let imageH = 0;

    if (r.imageUrl) {
      imageH = await addImageToDoc(r.imageUrl, margin, currentY, 60, 40);
    }

    const col1 = detailsX;
    const col2 = detailsX + 60;

    addLabelValue(doc, "Provider", r.provider, col1, currentY);
    addLabelValue(doc, "Car Type", r.carType?.name || "Car", col2, currentY);
    currentY += 15;

    const pickDate = r.pickupDate
      ? new Date(r.pickupDate).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
    const dropDate = r.dropoffDate
      ? new Date(r.dropoffDate).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

    addLabelValue(
      doc,
      "Pick-up",
      `${pickDate}\n(${r.pickupLocation})`,
      col1,
      currentY,
      55,
    );
    addLabelValue(
      doc,
      "Drop-off",
      `${dropDate}\n(${r.dropoffLocation})`,
      col2,
      currentY,
      55,
    );
    currentY += 20;

    const price = formatEUR(
      getCarPrice(props.trip.selectedCarRentalId || null),
    );
    addLabelValue(doc, "Price", price, col1, currentY);
    if (r.url) {
      addLabelValue(doc, "Booking Link", r.url, col2, currentY);
    }
    currentY += 15;

    if (r.notes) {
      const h = addLabelValue(
        doc,
        "Notes",
        r.notes,
        col1,
        currentY,
        contentWidth - imageColWidth,
      );
      currentY = Math.max(currentY + h + 5, currentY - 50 + imageH + 5);
    } else {
      currentY = Math.max(currentY + 5, currentY - 50 + imageH + 5);
    }
    currentY += 10;
  }

  // 3. Stays
  if (currentY > 220) {
    doc.addPage();
    addHeader(doc, props.trip.title);
    currentY = 38;
  }

  currentY = addSectionTitle(doc, "Itinerary & Stays", currentY);

  for (const stop of tripStops.value) {
    if (currentY > 220) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 38;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 122, 183);
    const stopNum = stopMarkerNums[stop.id];
    const stopTitle = stopNum ? `${stopNum}. ${stop.name}` : stop.name;
    doc.text(stopTitle, margin, currentY);

    const stopDates = `${new Date(stop.startDate).toLocaleDateString(undefined, { dateStyle: "medium" })} - ${new Date(stop.endDate).toLocaleDateString(undefined, { dateStyle: "medium" })}`;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(stopDates, pageWidth - margin, currentY, { align: "right" });
    currentY += 4;

    const acc = stop.selectedAccommodation;
    if (acc) {
      const imageColWidth = 65;
      const detailsX = margin + imageColWidth;
      let imageH = 0;

      if (acc.images?.[0]?.url) {
        imageH = await addImageToDoc(
          acc.images[0].url,
          margin,
          currentY + 4,
          60,
          40,
        );
      }

      const col1 = detailsX;
      const col2 = detailsX + 60;
      let stayY = currentY + 4;

      addLabelValue(doc, "Accommodation", acc.name, col1, stayY);
      addLabelValue(
        doc,
        "Room Type",
        acc.roomType?.name || "Standard",
        col2,
        stayY,
      );
      stayY += 15;

      const price = formatEUR(
        getAccommodationPrice(
          { stopSelections: { [stop.id]: stop.selectedAccommodationId } },
          stop.id,
        ),
      );
      addLabelValue(doc, "Price", price, col1, stayY);
      if (acc.provider) {
        addLabelValue(doc, "Provider", acc.provider, col2, stayY);
      }
      stayY += 15;

      if (acc.url) {
        addLabelValue(doc, "Booking Link", acc.url, col1, stayY);
        stayY += 15;
      }

      if (acc.notes) {
        const h = addLabelValue(
          doc,
          "Notes",
          acc.notes,
          col1,
          stayY,
          contentWidth - imageColWidth,
        );
        stayY += h + 5;
      }

      currentY = Math.max(stayY + 5, currentY + 4 + imageH + 5);
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150);
      doc.text(
        stop.type === "HUB" ? "Transit Point" : "No accommodation selected",
        margin,
        currentY + 5,
      );
      currentY += 12;
    }
    currentY += 5;
    doc.setTextColor(0);
  }

  // Summary
  if (currentY > 230) {
    doc.addPage();
    addHeader(doc, props.trip.title);
    currentY = 38;
  }
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  currentY = addSectionTitle(doc, "Financial Summary", currentY);

  const totalPerPerson = calculateCurrentTotal();
  const col1 = margin;
  const col2 = margin + 80;

  addLabelValue(
    doc,
    "Total Per Person",
    formatEUR(totalPerPerson),
    col1,
    currentY,
  );

  if (props.trip.people > 1) {
    addLabelValue(
      doc,
      `Grand Total (${props.trip.people} travelers)`,
      formatEUR(totalPerPerson * props.trip.people),
      col2,
      currentY,
    );
  }
  currentY += 20;

  // 5. Map
  const hasMapCoords =
    (props.trip.startLat != null && props.trip.startLng != null) ||
    stopsWithCoords.length > 0 ||
    (props.trip.endLat != null && props.trip.endLng != null);

  if (hasMapCoords) {
    if (currentY > 180) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 38;
    }

    const mapTitle = endMarkerNum
      ? `Trip Route Map (Stops 1-${endMarkerNum})`
      : "Trip Route Map";
    currentY = addSectionTitle(doc, mapTitle, currentY);

    const latLngs: [number, number][] = [];
    if (props.trip.startLat != null && props.trip.startLng != null) {
      latLngs.push([props.trip.startLat, props.trip.startLng]);
    }
    stopsWithCoords.forEach((s) => {
      if (s.lat != null && s.lng != null) {
        const last = latLngs[latLngs.length - 1];
        if (!last || last[0] !== s.lat || last[1] !== s.lng) {
          latLngs.push([s.lat, s.lng]);
        }
      }
    });
    if (props.trip.endLat != null && props.trip.endLng != null) {
      const last = latLngs[latLngs.length - 1];
      if (
        !last ||
        last[0] !== props.trip.endLat ||
        last[1] !== props.trip.endLng
      ) {
        latLngs.push([props.trip.endLat, props.trip.endLng]);
      }
    }

    if (latLngs.length > 0) {
      try {
        // Construct Yandex Static Map URL
        // Style: l=map (scheme), size=600,400
        // Markers: pt=lng,lat,color+size+label
        // Path: pl=c:0000ff88,w:5,lng,lat,lng,lat...

        const markers = latLngs
          .map((ll, i) => {
            let color = "pm2blm"; // Blue marker default
            if (i === 0)
              color = "pm2gnm"; // Green for start
            else if (i === latLngs.length - 1) color = "pm2rdm"; // Red for end

            return `${ll[1]},${ll[0]},${color}${i + 1}`;
          })
          .join("~");

        let path = `c:337ab7ff,w:5,${latLngs.map((ll) => `${ll[1]},${ll[0]}`).join(",")}`;

        // Attempt to get road route from OSRM
        if (latLngs.length > 1) {
          try {
            const coordsString = latLngs
              .map((ll) => `${ll[1]},${ll[0]}`)
              .join(";");
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
            const osrmData = await $fetch<any>(osrmUrl);
            if (osrmData?.routes?.[0]?.geometry?.coordinates) {
              const roadCoords: [number, number][] =
                osrmData.routes[0].geometry.coordinates;
              // Yandex has a limit on URL length, so we might need to simplify/sample the road coordinates
              const step = Math.max(1, Math.floor(roadCoords.length / 50));
              const sampledCoords = roadCoords.filter(
                (_, idx) => idx % step === 0,
              );
              // Ensure last point is included
              const lastRoadCoord = roadCoords[roadCoords.length - 1];
              if (
                lastRoadCoord &&
                sampledCoords[sampledCoords.length - 1] !== lastRoadCoord
              ) {
                sampledCoords.push(lastRoadCoord);
              }

              path = `c:337ab7ff,w:5,${sampledCoords.map((c) => `${c[0]},${c[1]}`).join(",")}`;
            }
          } catch (osrmError) {
            console.warn(
              "OSRM routing failed, falling back to straight lines",
              osrmError,
            );
          }
        }

        const mapUrl = `https://static-maps.yandex.ru/1.x/?l=map&lang=en_US&size=600,400&pt=${markers}&pl=${path}`;

        await addImageToDoc(
          mapUrl,
          margin,
          currentY,
          contentWidth,
          100,
          "contain",
        );
        currentY += 105;
      } catch (e) {
        console.error("Failed to add map to PDF", e);
      }
    }
  }

  addFooter(doc);
  doc.save(`Trip_Selection_${props.trip.title.replace(/\s+/g, "_")}.pdf`);
  toast.success("Current selection exported successfully");
};

const exportToPDF = async () => {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF("landscape");
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addHeader = (
    doc: any,
    title: string,
    subtitle = "Trip Comparison Sheet",
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

  addHeader(doc, `Trip Comparison: ${props.trip.title}`);

  const columns = [
    "Category",
    "Current Selection",
    ...(snapshots.value?.map((s) => s.name) || []),
  ];

  const rows = [];

  // Transportation Section
  rows.push([
    {
      content: "Transportation",
      colSpan: columns.length,
      styles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    },
  ]);

  // Flight Row
  const flightSplitLabel =
    props.trip.people > 1
      ? props.trip.splitFlightCost
        ? "\n(Shared)"
        : "\n(Individual)"
      : "";
  const flightRow = [`Flight${flightSplitLabel}`];
  if (props.trip.selectedFlight) {
    const f = props.trip.selectedFlight;
    const airline =
      f.airline?.name || (typeof f.airline === "string" ? f.airline : "Flight");
    const from =
      f.fromAirport?.symbol ||
      f.fromAirport?.name ||
      (typeof f.fromAirport === "string" ? f.fromAirport : "—");
    const to =
      f.toAirport?.symbol ||
      f.toAirport?.name ||
      (typeof f.toAirport === "string" ? f.toAirport : "—");
    const price = formatEUR(
      getFlightPrice(props.trip.selectedFlightId || null),
    );
    const stops = f.stops === 0 ? "Non-stop" : `${f.stops} stop(s)`;
    flightRow.push(`${airline}\n${from} -> ${to}\n${stops}\n${price}`);
  } else {
    flightRow.push("—");
  }

  snapshots.value?.forEach((s) => {
    const flight = allFlights.value?.find((f) => f.id === s.flightId);
    if (flight) {
      const airline =
        flight.airline?.name ||
        (typeof flight.airline === "string" ? flight.airline : "Flight");
      const from =
        flight.fromAirport?.symbol ||
        flight.fromAirport?.name ||
        (typeof flight.fromAirport === "string" ? flight.fromAirport : "—");
      const to =
        flight.toAirport?.symbol ||
        flight.toAirport?.name ||
        (typeof flight.toAirport === "string" ? flight.toAirport : "—");
      const price = formatEUR(getFlightPrice(s.flightId));
      const stops = flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`;
      flightRow.push(`${airline}\n${from} -> ${to}\n${stops}\n${price}`);
    } else {
      flightRow.push("—");
    }
  });
  rows.push(flightRow);

  // Car Rental Row
  const carSplitLabel =
    props.trip.people > 1
      ? props.trip.splitCarRentalCost
        ? "\n(Shared)"
        : "\n(Individual)"
      : "";
  const carRow = [`Car Rental${carSplitLabel}`];
  if (props.trip.selectedCarRental) {
    const r = props.trip.selectedCarRental;
    const price = formatEUR(
      getCarPrice(props.trip.selectedCarRentalId || null),
    );
    carRow.push(
      `${r.provider}\n${price}${r.notes ? `\nNote: ${r.notes}` : ""}`,
    );
  } else {
    carRow.push("—");
  }

  snapshots.value?.forEach((s) => {
    const car = allCars.value?.find((c) => c.id === s.carRentalId);
    if (car) {
      const price = formatEUR(getCarPrice(s.carRentalId));
      carRow.push(
        `${car.provider}\n${price}${car.notes ? `\nNote: ${car.notes}` : ""}`,
      );
    } else {
      carRow.push("—");
    }
  });
  rows.push(carRow);

  // Stays Section
  rows.push([
    {
      content: "Itinerary & Stays",
      colSpan: columns.length,
      styles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    },
  ]);

  const staySplitLabel =
    props.trip.people > 1
      ? props.trip.splitAccommodationCost
        ? "\n(Shared)"
        : "\n(Individual)"
      : "";

  tripStops.value.forEach((stop) => {
    const stopRow = [
      `${stop.name}${stop.type !== "HUB" ? staySplitLabel : ""}`,
    ];

    // Current
    const currentAcc = stop.selectedAccommodation;
    if (currentAcc) {
      const roomType = currentAcc.roomType?.name || "";
      const price = formatEUR(
        getAccommodationPrice(
          { stopSelections: { [stop.id]: stop.selectedAccommodationId } },
          stop.id,
        ),
      );
      stopRow.push(
        `${currentAcc.name}${roomType ? `\n${roomType}` : ""}\n${price}${currentAcc.notes ? `\nNote: ${currentAcc.notes}` : ""}`,
      );
    } else {
      stopRow.push(stop.type === "HUB" ? "Transit Point" : "—");
    }

    // Snapshots
    snapshots.value?.forEach((s) => {
      const selections =
        typeof s.stopSelections === "string"
          ? JSON.parse(s.stopSelections)
          : s.stopSelections;
      const accId = selections[stop.id];
      const stopData = allStops.value?.find((as) => as.id === stop.id);
      const acc = stopData?.accommodations?.find(
        (a: AccommodationOption) => a.id === accId,
      );
      if (acc) {
        const roomType = acc.roomType?.name || "";
        const price = formatEUR(getAccommodationPrice(s, stop.id));
        stopRow.push(
          `${acc.name}${roomType ? `\n${roomType}` : ""}\n${price}${acc.notes ? `\nNote: ${acc.notes}` : ""}`,
        );
      } else {
        stopRow.push(stop.type === "HUB" ? "Transit Point" : "—");
      }
    });
    rows.push(stopRow);
  });

  // Totals Section
  rows.push([
    {
      content: "Totals",
      colSpan: columns.length,
      styles: { fillColor: [230, 242, 255], fontStyle: "bold" },
    },
  ]);

  const totalRow = ["Total Per Person"];
  totalRow.push(formatEUR(calculateCurrentTotal()));
  snapshots.value?.forEach((s) => {
    totalRow.push(formatEUR(Number(s.totalCostEUR)));
  });
  rows.push(totalRow);

  if (props.trip.people > 1) {
    const grandTotalRow = ["Grand Total"];
    grandTotalRow.push(formatEUR(calculateCurrentTotal() * props.trip.people));
    snapshots.value?.forEach((s) => {
      grandTotalRow.push(formatEUR(Number(s.totalCostEUR) * props.trip.people));
    });
    rows.push(grandTotalRow);
  }

  autoTable(doc, {
    head: [columns],
    body: rows as any,
    startY: 30,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [51, 122, 183], textColor: 255 },
  });

  addFooter(doc);
  doc.save(`Trip_Comparison_${props.trip.title.replace(/\s+/g, "_")}.pdf`);
  toast.success("PDF exported successfully");
};

const generatedName = computed(() => {
  const parts = [];

  if (props.trip.selectedFlight) {
    const flight = props.trip.selectedFlight as any;
    const airline = flight.airline?.name || flight.airline || "Flight";
    parts.push(airline);
  }

  if (props.trip.selectedCarRental) {
    const car = props.trip.selectedCarRental as any;
    parts.push(car.provider || "Car");
  }

  const selectedAccommodations = tripStops.value
    .filter((s) => s.selectedAccommodation)
    .map((s) => s.selectedAccommodation?.name);

  if (selectedAccommodations.length > 0) {
    if (selectedAccommodations.length <= 2) {
      parts.push(...selectedAccommodations);
    } else {
      parts.push(
        `${selectedAccommodations[0]} + ${selectedAccommodations.length - 1} more`,
      );
    }
  }

  if (parts.length === 0)
    return `Comparison ${new Date().toLocaleDateString()}`;

  // Limit total length
  const name = parts.join(" + ");
  return name.length > 60 ? name.substring(0, 57) + "..." : name;
});

const deleteTitle = computed(() => {
  if (!snapshotToDeleteId.value) return "Delete Snapshot";
  const s = snapshots.value?.find((s) => s.id === snapshotToDeleteId.value);
  return s ? `Delete "${s.name}"?` : "Delete Snapshot";
});

const confirmDelete = async () => {
  if (!snapshotToDeleteId.value) return;
  try {
    deleting.value = true;
    await $fetch(
      `/api/trips/${props.trip.id}/snapshots/${snapshotToDeleteId.value}`,
      {
        method: "DELETE",
      },
    );
    toast.success("Snapshot deleted");
    await refreshSnapshots();
    isDeleteOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete snapshot");
  } finally {
    deleting.value = false;
    snapshotToDeleteId.value = null;
  }
};

// Use stops from the store for the current selection to ensure correct order
const tripStops = computed(() => {
  return stopsStore.byTrip[props.trip.id]?.items || props.trip.tripStops || [];
});

onMounted(() => {
  if (props.trip.id) {
    stopsStore.fetchByTrip(props.trip.id);
  }
});

// Fetch snapshots
const {
  data: snapshots,
  refresh: refreshSnapshots,
  pending: snapshotsPending,
} = await useFetch<any[]>(() => `/api/trips/${props.trip.id}/snapshots`);

// In-memory data for price calculation (stays in main component for logic consistency)
const { data: allFlights } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/flights`,
);
const { data: allCars } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/car-rentals`,
);
const { data: allStops } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/stops`,
);

const calculateFlightTotal = (flight: any) => {
  const base = Number(flight.baseFare) || 0;
  const seat = Number(flight.extras?.seatReservation) || 0;
  const bag = Number(flight.extras?.checkedBaggage) || 0;
  const other = Number(flight.extras?.other) || 0;
  return base + seat + bag + other;
};

const getFlightPrice = (flightId: string | null) => {
  if (!flightId) return 0;
  const f = allFlights.value?.find((f: any) => f.id === flightId);
  if (!f) return 0;
  const total = convertToEUR(calculateFlightTotal(f), f.currencyId);
  return props.trip.splitFlightCost ? total / (props.trip.people || 1) : total;
};

const calculateCarTotal = (car: any) => {
  const base = Number(car.baseRate) || 0;
  const fees = Number(car.fees) || 0;

  if (!car.pickupDate || !car.dropoffDate) return base + fees;

  const start = new Date(car.pickupDate);
  const end = new Date(car.dropoffDate);
  const diffDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const insurance = (Number(car.insurancePerDay) || 0) * diffDays;
  return base + fees + insurance;
};

const getCarPrice = (carId: string | null) => {
  if (!carId) return 0;
  const c = allCars.value?.find((c: any) => c.id === carId);
  if (!c) return 0;
  const total = convertToEUR(calculateCarTotal(c), c.currencyId);
  return props.trip.splitCarRentalCost
    ? total / (props.trip.people || 1)
    : total;
};

const getAccommodationPrice = (snapshot: any, stopId: string) => {
  try {
    const selections =
      typeof snapshot.stopSelections === "string"
        ? JSON.parse(snapshot.stopSelections)
        : snapshot.stopSelections;
    const accId = selections[stopId];
    if (!accId) return 0;

    const stop = allStops.value?.find((s: any) => s.id === stopId);
    const acc = stop?.accommodations?.find((a: any) => a.id === accId);
    if (!acc) return 0;

    let total = Number(acc.totalPrice || 0);

    // If no total price, calculate from nightly rate if available
    if (total === 0 && acc.nightlyRate && stop) {
      const start = new Date(stop.startDate);
      const end = new Date(stop.endDate);
      const diff = end.getTime() - start.getTime();
      const nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      total = Number(acc.nightlyRate) * nights;
    }

    const totalEUR = convertToEUR(total, acc.currencyId);
    return props.trip.splitAccommodationCost
      ? totalEUR / (props.trip.people || 1)
      : totalEUR;
  } catch {
    return 0;
  }
};

const calculateCurrentTotal = () => {
  let totalPerPerson = 0;

  if (props.trip.selectedFlight) {
    totalPerPerson += getFlightPrice(props.trip.selectedFlightId || null);
  }

  if (props.trip.selectedCarRental) {
    totalPerPerson += getCarPrice(props.trip.selectedCarRentalId || null);
  }

  for (const stop of tripStops.value || []) {
    if (stop.selectedAccommodationId) {
      totalPerPerson += getAccommodationPrice(
        {
          stopSelections: JSON.stringify({
            [stop.id]: stop.selectedAccommodationId,
          }),
        },
        stop.id,
      );
    }
  }

  return totalPerPerson;
};

const createSnapshot = async (name: string) => {
  const stopSelections: Record<string, string | null> = {};
  for (const stop of tripStops.value || []) {
    stopSelections[stop.id] = stop.selectedAccommodationId || null;
  }

  const totalCostEUR = calculateCurrentTotal();

  // Basic reasoning logic
  let reasoningText = `This option has a total cost of ${formatEUR(totalCostEUR)} per person.`;
  if (props.trip.people > 1) {
    reasoningText += ` (Grand total: ${formatEUR(totalCostEUR * props.trip.people)})`;
  }
  if (props.trip.selectedFlight) {
    const flight = props.trip.selectedFlight as any;
    const airlineName =
      flight.airline?.name || flight.airline || "Unknown Airline";
    reasoningText += ` Includes a flight with ${airlineName}.`;
  }

  try {
    await $fetch(`/api/trips/${props.trip.id}/snapshots`, {
      method: "POST",
      body: {
        name,
        flightId: props.trip.selectedFlightId,
        carRentalId: props.trip.selectedCarRentalId,
        stopSelections,
        totalCostEUR,
        reasoning: reasoningText,
      },
    });
    toast.success("Snapshot created");
    isCreateOpen.value = false;
    await refreshSnapshots();
  } catch (e) {
    console.error(e);
    toast.error("Failed to create snapshot");
  }
};

const deleteSnapshot = async (id: string) => {
  snapshotToDeleteId.value = id;
  isDeleteOpen.value = true;
};

const analysis = computed(() => {
  if (!snapshots.value || snapshots.value.length === 0) return null;

  const sortedByPrice = [...snapshots.value].sort(
    (a: any, b: any) => Number(a.totalCostEUR) - Number(b.totalCostEUR),
  );
  const cheapest = sortedByPrice[0];

  const snapshotsWithFlights = snapshots.value
    .map((s: any) => ({
      ...s,
      flight: allFlights.value?.find((f: any) => f.id === s.flightId),
    }))
    .filter((s) => s.flight);

  const mostConvenient =
    snapshotsWithFlights.length > 0
      ? snapshotsWithFlights.sort(
          (a, b) => (a.flight?.stops || 0) - (b.flight?.stops || 0),
        )[0]
      : null;

  return {
    bestValue: cheapest,
    mostConvenient: mostConvenient,
    summary: `Based on your ${snapshots.value.length} saved comparisons, we've identified the best options for your trip.`,
  };
});
</script>
