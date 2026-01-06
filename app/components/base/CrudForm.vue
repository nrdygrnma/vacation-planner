<template>
  <UForm ref="formRef" :schema="schema" :state="state" @submit="onSubmit">
    <slot :state="state" />
  </UForm>
</template>

<script lang="ts" setup>
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = withDefaults(
  defineProps<{
    state: Record<string, any>;
    schema?: z.ZodTypeAny | null;
    submitLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    submitLabel: "Save",
    cancelLabel: "Cancel",
  },
);

type Schema = z.output<NonNullable<typeof props.schema>>;

const emit = defineEmits<{
  (e: "submit", data: any): void;
  (e: "cancel"): void;
}>();

const formRef = ref<any>();

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  emit("submit", event.data);
};

defineExpose({
  submit: () => formRef.value?.submit?.(),
});
</script>
