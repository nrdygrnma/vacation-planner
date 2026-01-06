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
import type { AccommodationOption, Trip } from "@/types/tripTypes";
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";
import { useTripStopsStore } from "~/stores/tripStops";
import { toast } from "vue-sonner";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import ComparisonAnalysisModal from "~/components/sections/comparisons/ComparisonAnalysisModal.vue";
import ComparisonSnapshotModal from "~/components/sections/comparisons/ComparisonSnapshotModal.vue";
import ComparisonEmptyState from "~/components/sections/comparisons/ComparisonEmptyState.vue";
import ComparisonTable from "~/components/sections/comparisons/ComparisonTable.vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const addHeader = (doc: any, title: string) => {
    doc.setFontSize(18);
    doc.setTextColor(51, 122, 183);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, 15);
    doc.setDrawColor(51, 122, 183);
    doc.setLineWidth(0.5);
    doc.line(margin, 18, pageWidth - margin, 18);
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
    }
  };

  const addImageToDoc = async (
    url: string,
    x: number,
    y: number,
    maxW = 60,
    maxH = 40,
  ) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");

      const ratio = img.width / img.height;
      let imgWidth = maxW;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > maxH) {
        imgHeight = maxH;
        imgWidth = imgHeight * ratio;
      }

      doc.addImage(dataUrl, "JPEG", x, y, imgWidth, imgHeight);
      return imgHeight;
    } catch (e) {
      console.error("Failed to load image for PDF", e);
      return 0;
    }
  };

  addHeader(doc, props.trip.title);
  let currentY = 25;

  // 1. Flight
  if (props.trip.selectedFlight) {
    const f = props.trip.selectedFlight;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Transportation: Flight", margin, currentY);
    currentY += 7;

    const airline = f.airline?.name || f.airline || "Flight";
    const from =
      f.fromAirport?.symbol || f.fromAirport?.name || f.fromAirport || "—";
    const to = f.toAirport?.symbol || f.toAirport?.name || f.toAirport || "—";
    const stops = f.stops === 0 ? "Non-stop" : `${f.stops} stop(s)`;
    const price = formatEUR(
      getFlightPrice(props.trip.selectedFlightId || null),
    );
    const depDate = f.departureDate
      ? new Date(f.departureDate).toLocaleString()
      : "—";
    const arrDate = f.arrivalDate
      ? new Date(f.arrivalDate).toLocaleString()
      : "—";

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${airline}: ${from} -> ${to}`, margin, currentY);
    currentY += 5;
    doc.text(`Departure: ${depDate}`, margin, currentY);
    currentY += 5;
    doc.text(`Arrival: ${arrDate} (${stops})`, margin, currentY);
    currentY += 5;
    doc.text(
      `Price: ${price}${props.trip.people > 1 ? (props.trip.splitFlightCost ? " (Shared)" : " (Individual)") : ""}`,
      margin,
      currentY,
    );
    currentY += 12;
  }

  // 2. Car Rental
  if (props.trip.selectedCarRental) {
    const r = props.trip.selectedCarRental;
    if (currentY > 220) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 25;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Transportation: Car Rental", margin, currentY);
    currentY += 7;

    const imageColWidth = 65;
    const detailsX = margin + imageColWidth;
    let imageH = 0;

    if (r.imageUrl) {
      imageH = await addImageToDoc(r.imageUrl, margin, currentY, 60, 40);
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(r.provider, detailsX, currentY + 4);
    doc.setFont("helvetica", "normal");
    doc.text(r.carType?.name || "Car", detailsX, currentY + 9);

    const pickDate = r.pickupDate
      ? new Date(r.pickupDate).toLocaleString()
      : "—";
    const dropDate = r.dropoffDate
      ? new Date(r.dropoffDate).toLocaleString()
      : "—";

    doc.text(
      `Pick-up: ${pickDate} (${r.pickupLocation})`,
      detailsX,
      currentY + 14,
    );
    doc.text(
      `Drop-off: ${dropDate} (${r.dropoffLocation})`,
      detailsX,
      currentY + 19,
    );

    const price = formatEUR(
      getCarPrice(props.trip.selectedCarRentalId || null),
    );
    doc.text(
      `Price: ${price}${props.trip.people > 1 ? (props.trip.splitCarRentalCost ? " (Shared)" : " (Individual)") : ""}`,
      detailsX,
      currentY + 24,
    );

    if (r.notes) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      const notesLines = doc.splitTextToSize(
        r.notes,
        contentWidth - imageColWidth,
      );
      doc.text(notesLines, detailsX, currentY + 29);
    }

    currentY += Math.max(imageH, r.notes ? 35 : 25) + 10;
    doc.setTextColor(0);
  }

  // 3. Stays
  if (currentY > 240) {
    doc.addPage();
    addHeader(doc, props.trip.title);
    currentY = 25;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Itinerary & Stays", margin, currentY);
  currentY += 10;

  for (const stop of tripStops.value) {
    if (currentY > 230) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 122, 183);
    doc.text(stop.name, margin, currentY);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const stopDates = `${new Date(stop.startDate).toLocaleDateString()} - ${new Date(stop.endDate).toLocaleDateString()}`;
    doc.text(stopDates, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;
    doc.setTextColor(0);

    const acc = stop.selectedAccommodation;
    if (acc) {
      const imageColWidth = 65;
      const detailsX = margin + imageColWidth;
      let imageH = 0;

      if (acc.images?.[0]?.url) {
        imageH = await addImageToDoc(
          acc.images[0].url,
          margin,
          currentY,
          60,
          40,
        );
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(acc.name, detailsX, currentY + 4);
      doc.setFont("helvetica", "normal");
      doc.text(acc.roomType?.name || "Standard", detailsX, currentY + 9);

      const price = formatEUR(
        getAccommodationPrice(
          { stopSelections: { [stop.id]: stop.selectedAccommodationId } },
          stop.id,
        ),
      );
      doc.text(
        `Price: ${price}${props.trip.people > 1 ? (props.trip.splitAccommodationCost ? " (Shared)" : " (Individual)") : ""}`,
        detailsX,
        currentY + 14,
      );

      if (acc.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        const notesLines = doc.splitTextToSize(
          acc.notes,
          contentWidth - imageColWidth,
        );
        doc.text(notesLines, detailsX, currentY + 19);
      }
      currentY += Math.max(imageH, acc.notes ? 30 : 20) + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150);
      doc.text(
        stop.type === "HUB" ? "Transit Point" : "No accommodation selected",
        margin,
        currentY,
      );
      currentY += 10;
    }
    doc.setTextColor(0);
  }

  // Summary
  if (currentY > 240) {
    doc.addPage();
    addHeader(doc, props.trip.title);
    currentY = 25;
  }
  doc.setDrawColor(200);
  doc.setLineWidth(0.1);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", margin, currentY);
  currentY += 8;

  const totalPerPerson = calculateCurrentTotal();
  doc.setFontSize(12);
  doc.text(`Total Per Person: ${formatEUR(totalPerPerson)}`, margin, currentY);
  currentY += 6;

  if (props.trip.people > 1) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `Grand Total (${props.trip.people} travelers): ${formatEUR(totalPerPerson * props.trip.people)}`,
      margin,
      currentY,
    );
  }

  addFooter(doc);
  doc.save(`Trip_Selection_${props.trip.title.replace(/\s+/g, "_")}.pdf`);
  toast.success("Current selection exported successfully");
};

const exportToPDF = () => {
  const doc = new jsPDF("landscape");
  const title = `Trip Comparison: ${props.trip.title}`;

  doc.setFontSize(18);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

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
    const airline = f.airline?.name || f.airline || "Flight";
    const from =
      f.fromAirport?.symbol || f.fromAirport?.name || f.fromAirport || "—";
    const to = f.toAirport?.symbol || f.toAirport?.name || f.toAirport || "—";
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
      const airline = flight.airline?.name || flight.airline || "Flight";
      const from =
        flight.fromAirport?.symbol ||
        flight.fromAirport?.name ||
        flight.fromAirport ||
        "—";
      const to =
        flight.toAirport?.symbol ||
        flight.toAirport?.name ||
        flight.toAirport ||
        "—";
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
