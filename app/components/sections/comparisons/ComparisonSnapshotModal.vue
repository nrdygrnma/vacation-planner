<template>
  <CrudModal
    v-model:open="model"
    description="Save your current selections as a comparison point"
    submit-label="Create"
    title="Create Snapshot"
    @submit="onSubmit"
  >
    <UFormField label="Snapshot Name" name="name" required>
      <UInput
        v-model="name"
        class="w-full"
        placeholder="e.g. Budget Choice"
        @keyup.enter="onSubmit"
      />
    </UFormField>
  </CrudModal>
</template>

<script lang="ts" setup>
import CrudModal from "~/components/base/CrudModal.vue";

const props = defineProps<{
  open: boolean;
  initialName?: string;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", name: string): void;
}>();

const model = computed({
  get: () => props.open,
  set: (v) => emit("update:open", v),
});

const name = ref("");

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      name.value =
        props.initialName || `Comparison ${new Date().toLocaleDateString()}`;
    }
  },
);

const onSubmit = () => {
  emit("submit", name.value);
};
</script>
