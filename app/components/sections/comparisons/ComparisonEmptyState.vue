<template>
  <div class="space-y-6">
    <UAlert
      color="neutral"
      description="Save your current selection as a snapshot to compare it with other potential options later."
      icon="i-lucide-info"
      title="No snapshots yet"
      variant="soft"
    />

    <!-- Show current selection total even without snapshots -->
    <div
      class="overflow-hidden border border-gray-200 rounded-xl shadow-sm max-w-md"
    >
      <table class="w-full border-collapse bg-white text-sm">
        <tbody class="divide-y divide-gray-100">
          <tr class="bg-primary-50">
            <td class="p-4 font-bold text-primary-800">
              <div class="flex flex-col">
                <span>Current Total Per Person</span>
                <span class="text-[10px] font-normal opacity-70"
                  >Incl. shared costs split</span
                >
              </div>
            </td>
            <td class="p-4 font-black text-primary-900 text-lg">
              <div>{{ formatEUR(total) }}</div>
              <div
                v-if="people > 1"
                class="text-[10px] text-primary-600/70 font-bold mt-0.5"
              >
                Grand Total:
                {{ formatEUR(total * people) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";

defineProps<{
  total: number;
  people: number;
}>();

const { formatEUR } = useCurrencyUtils();
</script>
