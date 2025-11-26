<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <div>
      <label class="label-text">Trip Title</label>
      <input
        v-model="form.title"
        :aria-describedby="errors.title ? 'error-title' : undefined"
        :aria-invalid="!!errors.title"
        :class="['input w-full', errors.title && 'input-error']"
        required
        type="text"
        @blur="validateField('title')"
      />
      <p v-if="errors.title" id="error-title" class="mt-1 text-xs text-error">
        {{ errors.title }}
      </p>
    </div>

    <div>
      <label class="label-text">Cover image URL (optional)</label>
      <input
        v-model="form.imageUrl"
        class="input w-full"
        placeholder="https://example.com/photo.jpg"
        type="url"
      />
    </div>

    <div class="flex gap-4 max-sm:flex-col">
      <div class="w-full">
        <label class="label-text">Start Date</label>
        <input
          v-model="form.startDate"
          :aria-describedby="errors.startDate ? 'error-start' : undefined"
          :aria-invalid="!!errors.startDate"
          :class="['input w-full', errors.startDate && 'input-error']"
          required
          type="date"
          @blur="validateField('startDate')"
        />
        <p
          v-if="errors.startDate"
          id="error-start"
          class="mt-1 text-xs text-error"
        >
          {{ errors.startDate }}
        </p>
      </div>
      <div class="w-full">
        <label class="label-text">End Date</label>
        <input
          v-model="form.endDate"
          :aria-describedby="errors.endDate ? 'error-end' : undefined"
          :aria-invalid="!!errors.endDate"
          :class="['input w-full', errors.endDate && 'input-error']"
          required
          type="date"
          @blur="validateField('endDate')"
        />
        <p v-if="errors.endDate" id="error-end" class="mt-1 text-xs text-error">
          {{ errors.endDate }}
        </p>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="w-1/2">
        <label class="label-text">People</label>
        <input
          v-model.number="form.people"
          class="input w-full"
          min="1"
          type="number"
        />
      </div>

      <div class="w-1/2">
        <label class="label-text">Currency</label>
        <select
          v-model="form.currencyId"
          :aria-describedby="errors.currencyId ? 'error-currency' : undefined"
          :aria-invalid="!!errors.currencyId"
          :class="['select w-full', errors.currencyId && 'select-error']"
          required
          @blur="validateField('currencyId')"
          @change="validateField('currencyId')"
        >
          <option disabled value="">Choose currency</option>
          <option v-for="c in currencies" :key="c.id" :value="c.id">
            {{ c.symbol }} — {{ c.name }}
          </option>
        </select>
        <p
          v-if="errors.currencyId"
          id="error-currency"
          class="mt-1 text-xs text-error"
        >
          {{ errors.currencyId }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2 pt-2">
      <button class="btn btn-secondary btn-sm" type="button" @click="onCancel">
        Cancel
      </button>
      <button class="btn btn-primary btn-sm" type="submit">Save</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { Currency } from "@/types/tripTypes";

const props = defineProps<{
  initialValues?: Partial<{
    title: string;
    imageUrl: string | null;
    startDate: string | null;
    endDate: string | null;
    people: number;
    currencyId: string;
  }>;
  resetOnSubmit?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: any): void;
  (e: "cancel"): void;
}>();

const { data: currencies } = useFetch<Currency[]>("/api/currencies", {
  server: false,
});

const form = reactive({
  title: props.initialValues?.title ?? "",
  imageUrl: props.initialValues?.imageUrl ?? "",
  startDate: props.initialValues?.startDate ?? "",
  endDate: props.initialValues?.endDate ?? "",
  people: props.initialValues?.people ?? 1,
  currencyId: props.initialValues?.currencyId ?? "",
});

type Field = "title" | "startDate" | "endDate" | "currencyId";

const errors = reactive<Record<Field, string | "">>({
  title: "",
  startDate: "",
  endDate: "",
  currencyId: "",
});

function validateField(field: Field) {
  switch (field) {
    case "title":
      errors.title = form.title.trim() ? "" : "Title is required.";
      break;
    case "startDate":
      errors.startDate = form.startDate ? "" : "Start date is required.";
      break;
    case "endDate":
      errors.endDate = form.endDate ? "" : "End date is required.";
      break;
    case "currencyId":
      errors.currencyId = form.currencyId ? "" : "Currency is required.";
      break;
  }
}

function validateAll() {
  validateField("title");
  validateField("startDate");
  validateField("endDate");
  validateField("currencyId");
  return (
    !errors.title && !errors.startDate && !errors.endDate && !errors.currencyId
  );
}

const onSubmit = () => {
  if (!validateAll()) {
    return;
  }
  emit("submit", { ...form });
  if (props.resetOnSubmit) {
    form.title = "";
    form.imageUrl = "";
    form.startDate = "";
    form.endDate = "";
    form.people = 1;
    form.currencyId = "";
    errors.title = "";
    errors.startDate = "";
    errors.endDate = "";
    errors.currencyId = "";
  }
};

const onCancel = () => {
  emit("cancel");
};
</script>
