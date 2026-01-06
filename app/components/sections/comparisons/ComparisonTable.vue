<template>
  <div
    class="overflow-x-auto border border-gray-200 rounded-xl shadow-sm scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
  >
    <table class="w-full border-collapse bg-white text-sm min-w-[800px]">
      <thead>
        <tr class="bg-gray-50/80">
          <th
            class="p-4 text-left border-b font-bold text-gray-500 uppercase tracking-wider text-[10px] w-48"
          >
            Category
          </th>
          <th
            class="p-4 text-left border-b font-bold text-primary-700 bg-primary-50/30"
          >
            <div class="flex items-center gap-2">
              <UIcon class="size-4" name="i-lucide-check-circle" />
              Current Selection
            </div>
          </th>
          <th
            v-for="s in snapshots"
            :key="s.id"
            class="p-4 text-left border-b font-bold text-gray-700 min-w-[200px]"
          >
            <div class="flex justify-between items-start gap-2">
              <span class="truncate">{{ s.name }}</span>
              <UTooltip
                :content="{ align: 'center', side: 'top', sideOffset: 8 }"
                arrow
                text="Delete"
              >
                <UButton
                  color="error"
                  icon="i-lucide-trash"
                  variant="outline"
                  @click="$emit('deleteSnapshot', s.id)"
                />
              </UTooltip>
            </div>
            <div class="text-[10px] font-medium text-gray-400 mt-1">
              {{ new Date(s.createdAt).toLocaleDateString() }} ·
              {{
                new Date(s.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <!-- Transportation Section -->
        <tr class="bg-gray-50/50">
          <td
            class="p-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            colspan="100%"
          >
            Transportation
          </td>
        </tr>
        <tr class="hover:bg-gray-50/50 transition-colors">
          <td class="p-4 py-3 font-semibold text-gray-600 bg-gray-50/30">
            <div class="flex items-center gap-2">
              <UIcon class="size-6 opacity-50" name="i-lucide-plane" />
              Flight
            </div>
          </td>
          <td class="p-4 py-3 bg-primary-50/10">
            <ComparisonFlightCell
              :flight="trip.selectedFlight"
              :is-current="true"
              :price="getFlightPrice(trip.selectedFlightId || null)"
            />
          </td>
          <td v-for="s in snapshots" :key="s.id" class="p-4 py-3">
            <ComparisonFlightCell
              :flight="getFlight(s.flightId)"
              :price="getFlightPrice(s.flightId)"
            />
          </td>
        </tr>
        <tr class="hover:bg-gray-50/50 transition-colors">
          <td
            class="p-4 py-3 font-semibold text-gray-600 bg-gray-50/30 border-b-2 border-gray-100"
          >
            <div class="flex items-center gap-2">
              <UIcon class="size-6 opacity-50" name="i-lucide-car" />
              Car Rental
            </div>
          </td>
          <td class="p-4 py-3 bg-primary-50/10 border-b-2 border-gray-100">
            <ComparisonCarRentalCell
              :is-current="true"
              :price="getCarPrice(trip.selectedCarRentalId || null)"
              :rental="trip.selectedCarRental"
            />
          </td>
          <td
            v-for="s in snapshots"
            :key="s.id"
            class="p-4 py-3 border-b-2 border-gray-100"
          >
            <ComparisonCarRentalCell
              :price="getCarPrice(s.carRentalId)"
              :rental="getCarRental(s.carRentalId)"
            />
          </td>
        </tr>

        <!-- Stays Section -->
        <tr class="bg-gray-50/50">
          <td
            class="p-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            colspan="100%"
          >
            Itinerary & Stays
          </td>
        </tr>
        <tr
          v-for="(stop, idx) in tripStops"
          :key="stop.id"
          :class="[
            'hover:bg-gray-50/50 transition-colors',
            stop.type === 'HUB' ? 'bg-primary-50/20' : '',
          ]"
        >
          <td
            :class="[
              'p-4 py-3 font-semibold bg-gray-50/30',
              stop.type === 'HUB' ? 'text-primary-700' : 'text-gray-600',
            ]"
          >
            <div class="flex items-center gap-2">
              <UIcon
                :class="stop.type === 'HUB' ? 'text-primary-600' : 'opacity-50'"
                :name="getStopIcon(stop, idx, tripStops.length)"
                class="size-6"
              />
              <div class="flex flex-col">
                <span class="text-xs font-bold leading-tight">{{
                  stop.name
                }}</span>
              </div>
            </div>
          </td>
          <td class="p-4 py-3 bg-primary-50/10">
            <ComparisonAccommodationCell
              :accommodation="stop.selectedAccommodation"
              :is-current="true"
              :is-hub="stop.type === 'HUB'"
              :price="
                getAccommodationPrice(
                  {
                    stopSelections: {
                      [stop.id]: stop.selectedAccommodationId,
                    },
                  },
                  stop.id,
                )
              "
            />
          </td>
          <td v-for="s in snapshots" :key="s.id" class="p-4 py-3">
            <ComparisonAccommodationCell
              :accommodation="getAccommodation(s, stop.id)"
              :is-hub="stop.type === 'HUB'"
              :price="getAccommodationPrice(s, stop.id)"
            />
          </td>
        </tr>
        <tr class="bg-primary-50 border-t-2 border-primary-100">
          <td class="p-4 py-3 font-bold text-primary-800">
            <div class="flex flex-col">
              <span>Total Per Person</span>
              <span class="text-[10px] font-normal opacity-70"
                >Incl. shared costs split</span
              >
            </div>
          </td>
          <td class="p-4 py-3 font-black text-primary-900 text-lg">
            <div>{{ formatEUR(calculateCurrentTotal()) }}</div>
            <div
              v-if="trip.people > 1"
              class="text-[10px] text-primary-600/70 font-bold mt-0.5"
            >
              Grand Total:
              {{ formatEUR(calculateCurrentTotal() * trip.people) }}
            </div>
          </td>
          <td
            v-for="s in snapshots"
            :key="s.id"
            class="p-4 py-3 font-black text-primary-800 text-lg"
          >
            <div>{{ formatEUR(Number(s.totalCostEUR)) }}</div>
            <div
              v-if="trip.people > 1"
              class="text-[10px] text-gray-400 font-bold mt-0.5"
            >
              Grand Total:
              {{ formatEUR(Number(s.totalCostEUR) * trip.people) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";
import ComparisonFlightCell from "./ComparisonFlightCell.vue";
import ComparisonCarRentalCell from "./ComparisonCarRentalCell.vue";
import ComparisonAccommodationCell from "./ComparisonAccommodationCell.vue";

const props = defineProps<{
  trip: any;
  snapshots: any[];
  tripStops: any[];
}>();

defineEmits<{
  (e: "deleteSnapshot", id: string): void;
}>();

const { convertToEUR, formatEUR } = useCurrencyUtils();

// Fetch necessary data for ID resolution
const { data: allFlights } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/flights`,
);
const { data: allCars } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/car-rentals`,
);
const { data: allStops } = await useFetch<any[]>(
  () => `/api/trips/${props.trip.id}/stops`,
);

const getFlight = (id: string | null) => {
  if (!id) return null;
  return allFlights.value?.find((f: any) => f.id === id) || null;
};

const getCarRental = (id: string | null) => {
  if (!id) return null;
  return allCars.value?.find((c: any) => c.id === id) || null;
};

const getAccommodation = (snapshot: any, stopId: string) => {
  try {
    const selections =
      typeof snapshot.stopSelections === "string"
        ? JSON.parse(snapshot.stopSelections)
        : snapshot.stopSelections;
    const accId = selections[stopId];
    if (!accId) return null;

    const stop = allStops.value?.find((s: any) => s.id === stopId);
    const acc = stop?.accommodations?.find((a: any) => a.id === accId);
    return acc;
  } catch {
    return null;
  }
};

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

const getStopIcon = (stop: any, idx: number, total: number) => {
  if (stop.type !== "HUB") return "i-lucide-bed";
  if (idx === 0) return "i-lucide-plane-takeoff";
  if (idx === total - 1) return "i-lucide-plane-landing";
  return "i-lucide-plane";
};

const calculateCurrentTotal = () => {
  let totalPerPerson = 0;

  if (props.trip.selectedFlight) {
    totalPerPerson += getFlightPrice(props.trip.selectedFlightId || null);
  }

  if (props.trip.selectedCarRental) {
    totalPerPerson += getCarPrice(props.trip.selectedCarRentalId || null);
  }

  for (const stop of props.tripStops || []) {
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
</script>
