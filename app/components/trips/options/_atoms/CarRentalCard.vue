<template>
  <article
    class="rounded-md border border-slate-200 bg-white p-3 text-xs flex flex-col gap-1"
  >
    <!-- Header row -->
    <div class="flex items-center justify-between gap-3">
      <div class="font-medium text-slate-800">
        {{ rental.provider }}
        <span class="text-slate-500">
          · {{ rental.pickupLocation }} → {{ rental.dropoffLocation }}
        </span>
      </div>

      <div class="text-[11px] text-slate-500">
        {{ formatDate(rental.pickupDate) }} →
        {{ formatDate(rental.dropoffDate) }}
      </div>
    </div>

    <!-- Info row -->
    <div class="flex items-center justify-between gap-3 text-[11px] text-slate-600">
      <div>
        Base: {{ formatMoney(rental.baseRate) }} €
        <span v-if="rental.fees"> · Fees: {{ formatMoney(rental.fees) }} €</span>
        <span v-if="rental.insurancePerDay">
          · Insurance: {{ formatMoney(rental.insurancePerDay) }} €/day
        </span>
      </div>

      <div>{{ formatMoney(rental.totalCostEUR) }} €</div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-md border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-50"
          @click="$emit('edit', rental)"
        >
          Edit
        </button>

        <button
          class="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
          @click="$emit('delete', rental.id)"
        >
          Delete
        </button>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import type { CarRentalOption } from "@/types/tripTypes";

const props = defineProps<{ rental: CarRentalOption }>();

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "Date unknown";

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
