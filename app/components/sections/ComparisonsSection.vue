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
          color="neutral"
          icon="i-lucide-brain-circuit"
          label="Analyze"
          size="sm"
          variant="outline"
          @click="showReasoning = true"
        />
        <UButton
          v-if="snapshots?.length"
          color="neutral"
          icon="i-lucide-file-text"
          label="Export PDF"
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
import type { Trip } from "@/types/tripTypes";
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
  const flightRow = ["Flight"];
  flightRow.push(
    props.trip.selectedFlight
      ? `${props.trip.selectedFlight.airline?.name || props.trip.selectedFlight.airline} (${formatEUR(getFlightPrice(props.trip.selectedFlightId || null))})`
      : "—",
  );
  snapshots.value?.forEach((s) => {
    const flight = allFlights.value?.find((f) => f.id === s.flightId);
    flightRow.push(
      flight
        ? `${flight.airline?.name || flight.airline} (${formatEUR(getFlightPrice(s.flightId))})`
        : "—",
    );
  });
  rows.push(flightRow);

  // Car Rental Row
  const carRow = ["Car Rental"];
  carRow.push(
    props.trip.selectedCarRental
      ? `${props.trip.selectedCarRental.provider} (${formatEUR(getCarPrice(props.trip.selectedCarRentalId || null))})`
      : "—",
  );
  snapshots.value?.forEach((s) => {
    const car = allCars.value?.find((c) => c.id === s.carRentalId);
    carRow.push(
      car ? `${car.provider} (${formatEUR(getCarPrice(s.carRentalId))})` : "—",
    );
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

  tripStops.value.forEach((stop) => {
    const stopRow = [stop.name];

    // Current
    const currentAcc = stop.selectedAccommodation;
    stopRow.push(
      currentAcc
        ? `${currentAcc.name} (${formatEUR(getAccommodationPrice({ stopSelections: { [stop.id]: stop.selectedAccommodationId } }, stop.id))})`
        : stop.type === "HUB"
          ? "Transit Point"
          : "—",
    );

    // Snapshots
    snapshots.value?.forEach((s) => {
      const selections =
        typeof s.stopSelections === "string"
          ? JSON.parse(s.stopSelections)
          : s.stopSelections;
      const accId = selections[stop.id];
      const stopData = allStops.value?.find((as) => as.id === stop.id);
      const acc = stopData?.accommodations?.find((a) => a.id === accId);
      stopRow.push(
        acc
          ? `${acc.name} (${formatEUR(getAccommodationPrice(s, stop.id))})`
          : stop.type === "HUB"
            ? "Transit Point"
            : "—",
      );
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
  return convertToEUR(calculateFlightTotal(f), f.currencyId);
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
  return (
    convertToEUR(calculateCarTotal(c), c.currencyId) / (props.trip.people || 1)
  );
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

    return convertToEUR(total, acc.currencyId) / (props.trip.people || 1);
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
