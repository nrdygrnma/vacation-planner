<template>
  <div class="card card-border card-compact bg-base-100 shadow-sm">
    <div class="card-body p-3 gap-2">
      <!-- Top Row -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-[13px] text-slate-800 leading-none">
              {{ rental.provider }}
            </h3>

            <span
              class="badge badge-soft badge-primary badge-xs uppercase tracking-wide"
            >
              {{ rental.pickupLocation }} → {{ rental.dropoffLocation }}
            </span>
          </div>

          <div class="text-[11px] text-slate-500">
            {{ formatDate(rental.pickupDate) }} →
            {{ formatDate(rental.dropoffDate) }}
            <span class="ml-1 text-slate-400">
              ({{ rentalDaysFromOption(rental) }} days)
            </span>
          </div>
        </div>

        <div class="text-right leading-tight">
          <div class="text-[10px] uppercase text-slate-400">Total</div>
          <div class="text-sm font-bold text-slate-800">
            {{ formatMoney(rental.totalCostEUR) }} €
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-slate-200"></div>

      <!-- Price breakdown -->
      <div class="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
        <div>
          <div class="text-[10px] uppercase text-slate-400">Base</div>
          <div class="font-medium">{{ formatMoney(rental.baseRate) }} €</div>
        </div>

        <div v-if="rental.fees">
          <div class="text-[10px] uppercase text-slate-400">Fees</div>
          <div class="font-medium">{{ formatMoney(rental.fees) }} €</div>
        </div>

        <div v-if="rental.insurancePerDay">
          <div class="text-[10px] uppercase text-slate-400">Insurance</div>
          <div class="font-medium">
            {{ formatMoney(rental.insurancePerDay) }} €/day
          </div>
        </div>
      </div>

      <!-- Booking URL -->
      <div v-if="rental.bookingUrl" class="text-[11px] mt-1">
        <a
          :href="rental.bookingUrl"
          class="link link-primary no-underline break-all"
          target="_blank"
        >
          Open booking link
        </a>
      </div>

      <!-- Notes -->
      <div
        v-if="rental.notes"
        class="text-[11px] text-slate-700 leading-snug mt-1"
      >
        <span class="font-medium text-slate-500">Notes: </span
        >{{ rental.notes }}
      </div>

      <!-- Actions -->
      <div class="card-actions justify-end gap-1 mt-1">
        <button class="btn btn-xs btn-primary" @click="emit('edit', rental)">
          Edit
        </button>

        <button
          class="btn btn-xs btn-outline btn-error"
          @click="emit('delete', rental.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CarRentalOption } from "@/types/tripTypes";
import { rentalDaysFromOption } from "@/utils/rentals";

const props = defineProps<{ rental: CarRentalOption }>();
const emit = defineEmits<{
  (e: "edit", r: CarRentalOption): void;
  (e: "delete", id: string): void;
}>();

const formatDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString() : "Date unknown";

const formatMoney = (value: unknown): string => {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  return Number.isFinite(num) ? num.toFixed(0) : "—";
};
</script>
