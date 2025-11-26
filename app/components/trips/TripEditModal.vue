<template>
  <div>
    <FlyonModalTrigger
      :id="modalId"
      :buttonClasses="['btn-circle btn-secondary']"
    >
      <Icon class="size-4" name="lucide:pencil" />
    </FlyonModalTrigger>

    <FlyonModal :id="modalId" ref="modalRef" title="Edit Trip">
      <TripForm
        :initialValues="initialValues"
        @cancel="modalRef?.close"
        @submit="submit"
      />
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "@/components/base/FlyonModal.vue";
import FlyonModalTrigger from "@/components/base/FlyonModalTrigger.vue";
import TripForm from "./TripForm.vue";
import type { Trip } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{ trip: Trip }>();
const modalId = `trip-edit-${props.trip.id}`;
const modalRef = ref();

const initialValues = {
  title: props.trip.title,
  imageUrl: props.trip.imageUrl ?? "",
  startDate: props.trip.startDate?.slice(0, 10) ?? "",
  endDate: props.trip.endDate?.slice(0, 10) ?? "",
  people: props.trip.people,
  currencyId: props.trip.currencyId,
};

const emit = defineEmits(["saved"]);

const submit = async (data: any) => {
  await $fetch(`/api/trips/${props.trip.id}`, {
    method: "PUT",
    body: data,
  });

  modalRef.value?.close?.();
  emit("saved");
  toast.success("Trip updated");
};
</script>
