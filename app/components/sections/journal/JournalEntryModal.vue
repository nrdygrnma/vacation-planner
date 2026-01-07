<template>
  <UModal
    :description="entry ? 'Update your daily journal' : 'Write about your day'"
    :open="open"
    :title="entry ? 'Edit Journal Entry' : 'New Journal Entry'"
    @update:open="$emit('update:open', $event)"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Date" name="date" required>
          <UInput v-model="state.date" type="date" />
        </UFormField>

        <UFormField label="What happened today?" name="content" required>
          <UTextarea
            v-model="state.content"
            :rows="6"
            class="w-full"
            placeholder="Write your thoughts..."
          />
        </UFormField>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-semibold">Photos</h5>
            <UButton
              color="neutral"
              icon="i-lucide-plus"
              label="Add Photo URL"
              size="xs"
              variant="ghost"
              @click="addPhoto"
            />
          </div>

          <div
            v-for="(photo, index) in state.photos"
            :key="index"
            class="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2"
          >
            <div class="flex gap-2">
              <UInput
                v-model="photo.url"
                class="flex-1"
                placeholder="Photo URL (https://...)"
              />
              <UButton
                color="error"
                icon="i-lucide-trash"
                size="sm"
                variant="ghost"
                @click="removePhoto(index)"
              />
            </div>
            <UInput
              v-model="photo.caption"
              placeholder="Add a caption (optional)"
              size="sm"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            color="neutral"
            variant="soft"
            @click="$emit('update:open', false)"
          >
            Cancel
          </UButton>
          <UButton :loading="submitting" color="primary" type="submit">
            {{ entry ? "Save changes" : "Create entry" }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from "zod";
import { type JournalEntry } from "@/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{
  open: boolean;
  entry: JournalEntry | null;
  tripId: string;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "success"): void;
}>();

const submitting = ref(false);

const state = reactive({
  date: "",
  content: "",
  photos: [] as { url: string; caption: string }[],
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.entry) {
        state.date = props.entry.date.split("T")[0];
        state.content = props.entry.content;
        state.photos = props.entry.photos.map((p) => ({
          url: p.url,
          caption: p.caption || "",
        }));
      } else {
        state.date = new Date().toISOString().split("T")[0];
        state.content = "";
        state.photos = [];
      }
    }
  },
);

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  content: z.string().min(1, "Content is required"),
  photos: z
    .array(
      z.object({
        url: z.string().url("Must be a valid URL"),
        caption: z.string().optional(),
      }),
    )
    .optional(),
});

const addPhoto = () => {
  state.photos.push({ url: "", caption: "" });
};

const removePhoto = (index: number) => {
  state.photos.splice(index, 1);
};

const onSubmit = async () => {
  try {
    submitting.value = true;
    const url = props.entry
      ? `/api/trips/${props.tripId}/journal/${props.entry.id}`
      : `/api/trips/${props.tripId}/journal`;

    await $fetch(url, {
      method: props.entry ? "PUT" : "POST",
      body: state,
    });

    toast.success(props.entry ? "Entry updated" : "Entry created");
    emit("success");
    emit("update:open", false);
  } catch (e) {
    console.error(e);
    toast.error("Failed to save entry");
  } finally {
    submitting.value = false;
  }
};
</script>
