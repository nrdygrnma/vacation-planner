<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
    <component
      :is="card"
      v-for="item in items"
      :key="item[idKey]"
      v-bind="{ [propName]: item }"
      @changed="forward('changed', undefined)"
      @delete="forward('delete', $event)"
      @open="forward('open', $event)"
      @select="forward('select', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  items: any[];
  card: any;
  propName?: string;
  idKey?: string;
}>();

const emit = defineEmits<{
  (e: "open", payload: any): void;
  (e: "changed"): void;
  (e: "delete", payload: any): void;
  (e: "select", payload: any): void;
}>();

const propName = props.propName ?? "item";
const idKey = props.idKey ?? "id";

type EmitPayload = {
  open: any;
  delete: any;
  select: any;
  changed: void;
};

function forward<E extends keyof EmitPayload>(
  event: E,
  payload: EmitPayload[E],
) {
  emit(event, payload as any);
}
</script>
