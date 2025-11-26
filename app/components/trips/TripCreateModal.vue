<template>
  <div>
    <FlyonModalTrigger id="trip-create-modal" :buttonClasses="['btn-primary']">
      <Icon class="size-4" name="lucide:map-pin-plus" />
      Create trip
    </FlyonModalTrigger>

    <FlyonModal id="trip-create-modal" ref="modalRef" title="Create Trip">
      <TripForm :key="formKey" @cancel="onCancel" @submit="submit" />
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "~/components/modals/FlyonModal.vue";
import FlyonModalTrigger from "~/components/modals/FlyonModalTrigger.vue";
import TripForm from "./TripForm.vue";
import { toast } from "vue-sonner";

const emit = defineEmits(["saved"]);

const modalRef = ref();
const formKey = ref(0);
const resetForm = () => {
  formKey.value++;
};

const onCancel = () => {
  modalRef.value?.close?.();
  resetForm();
};

const submit = async (data: any) => {
  try {
    await $fetch("/api/trips", { method: "POST", body: data });

    modalRef.value?.close?.();
    resetForm();

    emit("saved");
    toast.success("Trip created");
  } catch (e) {
    console.error(e);
    toast.error("Failed to create trip");
  }
};
</script>
