<template>
  <div>
    <FlyonModalTrigger id="trip-create-modal" :buttonClasses="['btn-primary']">
      <Icon class="size-4" name="lucide:map-pin-plus" />
      Create trip
    </FlyonModalTrigger>

    <FlyonModal id="trip-create-modal" ref="modalRef" title="Create Trip">
      <TripForm @cancel="modalRef?.close" @submit="submit" />
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "@/components/base/FlyonModal.vue";
import FlyonModalTrigger from "@/components/base/FlyonModalTrigger.vue";
import TripForm from "./TripForm.vue";
import { toast } from "vue-sonner";

const modalRef = ref();

const emit = defineEmits(["saved"]);

const submit = async (data: any) => {
  try {
    await $fetch("/api/trips", { method: "POST", body: data });

    modalRef.value?.close?.();

    emit("saved");
    toast.success("Trip created");
  } catch (e) {
    console.error(e);
    toast.error("Failed to create trip");
  }
};
</script>
