<template>
  <div class="flex flex-col justify-between gap-4">
    <h1 class="text-3xl text-primary font-light">Currency Management</h1>

    <div class="mt-2">
      <UCard class="w-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">
            Exchange Rates (Relative to EUR)
          </h2>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            label="Add Currency"
            @click="openAddModal"
          />
        </div>

        <UTable :columns="columns" :data="tableData">
          <template #rateToEUR-cell="{ row }">
            {{ Number((row.original as Currency).rateToEUR).toFixed(4) }} EUR
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UTooltip
                :content="{ align: 'center', side: 'top', sideOffset: 8 }"
                arrow
                text="Edit"
              >
                <UButton
                  color="neutral"
                  icon="i-lucide-pencil"
                  variant="outline"
                  @click="openEditModal(row.original as Currency)"
                />
              </UTooltip>

              <UTooltip
                :content="{ align: 'center', side: 'top', sideOffset: 8 }"
                arrow
                text="Delete"
              >
                <UButton
                  color="error"
                  icon="i-lucide-trash"
                  variant="outline"
                  @click="onDelete(row.original as Currency)"
                />
              </UTooltip>
            </div>
          </template>
        </UTable>
      </UCard>
    </div>

    <CrudModal
      v-model:open="isModalOpen"
      :description="
        isEditing ? 'Update currency details' : 'Add a new currency'
      "
      :title="isEditing ? 'Edit Currency' : 'Add Currency'"
      @submit="onModalSubmit"
    >
      <CurrencyForm
        :key="formKey"
        ref="formRef"
        :initial-values="formInitialValues"
        @cancel="isModalOpen = false"
        @submit="onFormSubmit"
      />
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :title="`Delete ${currencyToDelete?.name}?`"
      description="This action cannot be undone."
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<script lang="ts" setup>
import CrudModal from "~/components/base/CrudModal.vue";
import CurrencyForm from "~/components/currencies/CurrencyForm.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { toast } from "vue-sonner";
import type { Currency } from "~/types/tripTypes";

const { data: currencies, refresh } =
  await useFetch<Currency[]>("/api/currencies");

const tableData = computed(() => currencies.value || []);

const columns = [
  { id: "name", accessorKey: "name", header: "Name" },
  { id: "symbol", accessorKey: "symbol", header: "Symbol" },
  { id: "rateToEUR", accessorKey: "rateToEUR", header: "Rate to EUR" },
  { id: "actions", accessorKey: "actions", header: "Actions" },
];

const isModalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const formKey = ref(0);
const formRef = ref<InstanceType<typeof CurrencyForm> | null>(null);

const formInitialValues = computed(() => {
  if (!isEditing.value || !editingId.value) return undefined;
  const c = currencies.value?.find(
    (curr: Currency) => curr.id === editingId.value,
  );
  if (!c) return undefined;
  return {
    name: c.name,
    symbol: c.symbol,
    rateToEUR: Number(c.rateToEUR),
  };
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formKey.value++;
  isModalOpen.value = true;
};

const openEditModal = (currency: Currency) => {
  isEditing.value = true;
  editingId.value = currency.id;
  formKey.value++;
  isModalOpen.value = true;
};

const onModalSubmit = () => {
  formRef.value?.submit();
};

const onFormSubmit = async (formData: any) => {
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/currencies/${editingId.value}`, {
        method: "PUT",
        body: formData,
      });
      toast.success("Currency updated");
    } else {
      await $fetch("/api/currencies", {
        method: "POST",
        body: formData,
      });
      toast.success("Currency added");
    }
    isModalOpen.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    toast.error("Failed to save currency");
  }
};

const isDeleteOpen = ref(false);
const deleting = ref(false);
const currencyToDelete = ref<Currency | null>(null);

const onDelete = (currency: Currency) => {
  currencyToDelete.value = currency;
  isDeleteOpen.value = true;
};

const onDeleteConfirm = async () => {
  if (!currencyToDelete.value) return;
  try {
    deleting.value = true;
    await $fetch(`/api/currencies/${currencyToDelete.value.id}`, {
      method: "DELETE",
    });
    toast.success("Currency deleted");
    await refresh();
    isDeleteOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete currency");
  } finally {
    deleting.value = false;
    currencyToDelete.value = null;
  }
};
</script>
