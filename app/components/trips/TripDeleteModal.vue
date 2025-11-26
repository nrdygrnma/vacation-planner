<template>
  <div>
    <FlyonModalTrigger :id="modalId" :buttonClasses="['btn-circle btn-error']">
      <Icon class="size-4" name="lucide:trash-2" />
    </FlyonModalTrigger>

    <FlyonModal :id="modalId" ref="modalRef" title="Delete Trip">
      <div class="space-y-2">
        <p>Are you sure you want to delete "{{ trip.title }}"?</p>
        <p class="text-error text-sm">This action cannot be undone.</p>
      </div>

      <template #footer="{ close }">
        <button class="btn btn-secondary btn-sm" @click="close">Cancel</button>
        <button class="btn btn-error btn-sm" @click="onDelete">Delete</button>
      </template>
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "~/components/modals/FlyonModal.vue";
import FlyonModalTrigger from "~/components/modals/FlyonModalTrigger.vue";
import { toast } from "vue-sonner";

const props = defineProps<{ trip: any }>();
const emit = defineEmits(["deleted"]);
const modalRef = ref();
const modalId = `trip-delete-${props.trip.id}`;

const onDelete = async () => {
  try {
    await $fetch(`/api/trips/${props.trip.id}`, { method: "DELETE" });

    modalRef.value?.close?.();

    toast.success("Trip deleted");
    emit("deleted");
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete trip");
  }
};
</script>
