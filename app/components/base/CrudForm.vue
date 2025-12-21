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
    initialState: Record<string, any>;
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
  (e: "submit", state: Record<string, any>): void;
  (e: "cancel"): void;
}>();

const state = reactive({ ...(props.initialState || {}) });
const formRef = ref<any>();

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  emit("submit", { ...(event?.data as any) });
};

defineExpose({
  submit: () => formRef.value?.submit?.(),
});
</script>
