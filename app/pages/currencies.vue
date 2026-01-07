<template>
  <div class="flex flex-col justify-between gap-4">
    <h1 class="text-3xl text-primary font-light">Currency Management</h1>

    <div class="mt-2">
      <UCard class="w-full">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-lg font-semibold">
              Exchange Rates (Relative to EUR)
            </h2>
            <p class="text-xs text-gray-500 italic">
              Rates are updated live via Frankfurter API
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              :loading="syncing"
              color="neutral"
              icon="i-lucide-refresh-cw"
              label="Fetch Rates"
              variant="soft"
              @click="onSync"
            />
          </div>
        </div>

        <UTable
          :columns="columns.filter((c) => c.id !== 'actions')"
          :data="tableData"
        >
          <template #rateToEUR-cell="{ row }">
            {{ Number((row.original as Currency).rateToEUR).toFixed(4) }} EUR
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner";
import type { Currency } from "~/types/tripTypes";

const { data: currencies, refresh } =
  await useFetch<Currency[]>("/api/currencies");

const tableData = computed(() => currencies.value || []);

const columns = [
  { id: "name", accessorKey: "name", header: "Name" },
  { id: "symbol", accessorKey: "symbol", header: "Symbol" },
  { id: "rateToEUR", accessorKey: "rateToEUR", header: "Rate to EUR" },
];

const syncing = ref(false);

const onSync = async () => {
  try {
    syncing.value = true;
    await $fetch("/api/currencies/sync", { method: "POST" });
    await refresh();
    toast.success("Exchange rates synchronized");
  } catch (e) {
    console.error(e);
    toast.error("Failed to synchronize rates");
  } finally {
    syncing.value = false;
  }
};
</script>
