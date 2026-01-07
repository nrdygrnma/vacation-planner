<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-book-marked" />
        Trip Journal
      </h3>
      <div class="flex items-center gap-2">
        <UButton
          v-if="journalEntries?.length"
          color="neutral"
          icon="i-lucide-file-text"
          label="Export Journal"
          size="sm"
          variant="outline"
          @click="exportJournalToPDF"
        />
        <UButton
          color="primary"
          icon="i-lucide-plus"
          label="Add Entry"
          size="sm"
          @click="openCreateModal"
        />
      </div>
    </div>

    <div v-if="pending" class="text-center py-10">
      <UIcon
        class="size-8 animate-spin text-primary"
        name="i-lucide-loader-2"
      />
      <p class="mt-2 text-gray-500 text-sm">Loading journal...</p>
    </div>

    <div
      v-else-if="!journalEntries?.length"
      class="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
    >
      <div
        class="size-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 mb-4"
      >
        <UIcon class="size-6 text-gray-400" name="i-lucide-pen-line" />
      </div>
      <h4 class="text-gray-900 font-medium">No journal entries yet</h4>
      <p class="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
        Start documenting your trip! Add photos and daily notes to preserve your
        memories.
      </p>
      <UButton
        class="mt-6"
        color="primary"
        icon="i-lucide-plus"
        label="Create First Entry"
        variant="soft"
        @click="openCreateModal"
      />
    </div>

    <div
      v-else
      class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent"
    >
      <JournalEntryCard
        v-for="entry in sortedEntries"
        :key="entry.id"
        :entry="entry"
        @delete="onDeleteEntry(entry)"
        @edit="openEditModal(entry)"
      />
    </div>

    <JournalEntryModal
      v-model:open="isModalOpen"
      :entry="editingEntry"
      :trip-id="trip.id"
      @success="refresh"
    />

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      description="This entry and its photos will be permanently removed."
      title="Delete journal entry?"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import { type JournalEntry, type Trip } from "@/types/tripTypes";
import JournalEntryCard from "./journal/JournalEntryCard.vue";
import JournalEntryModal from "./journal/JournalEntryModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  trip: Trip;
}>();

const {
  data: journalEntries,
  pending,
  refresh,
} = await useFetch<JournalEntry[]>(() => `/api/trips/${props.trip.id}/journal`);

const sortedEntries = computed(() => {
  if (!journalEntries.value) return [];
  return [...journalEntries.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

const isModalOpen = ref(false);
const editingEntry = ref<JournalEntry | null>(null);

const isDeleteOpen = ref(false);
const deleting = ref(false);
const entryToDelete = ref<JournalEntry | null>(null);

const openCreateModal = () => {
  editingEntry.value = null;
  isModalOpen.value = true;
};

const openEditModal = (entry: JournalEntry) => {
  editingEntry.value = entry;
  isModalOpen.value = true;
};

const onDeleteEntry = (entry: JournalEntry) => {
  entryToDelete.value = entry;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!entryToDelete.value) return;
  try {
    deleting.value = true;
    await $fetch(
      `/api/trips/${props.trip.id}/journal/${entryToDelete.value.id}`,
      {
        method: "DELETE",
      },
    );
    toast.success("Entry deleted");
    await refresh();
    isDeleteOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to delete entry");
  } finally {
    deleting.value = false;
    entryToDelete.value = null;
  }
};

const exportJournalToPDF = async () => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  const addHeader = (doc: any, title: string, subtitle = "Trip Journal") => {
    const primaryColor = [51, 122, 183];
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, margin, 26);

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, 28, pageWidth - margin, 28);
  };

  const addFooter = (doc: any) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        margin,
        pageHeight - 10,
      );
      doc.text("Vacation Planner", pageWidth - margin, pageHeight - 10, {
        align: "right",
      });
    }
  };

  const addImageToDoc = async (
    url: string,
    x: number,
    y: number,
    maxW = 60,
    maxH = 40,
  ) => {
    try {
      const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;
      const img = new Image();
      img.crossOrigin = "Anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = proxyUrl;
      });

      const canvas = document.createElement("canvas");
      const targetRatio = maxW / maxH;
      const imgRatio = img.width / img.height;
      let drawW,
        drawH,
        drawX = 0,
        drawY = 0;

      if (imgRatio > targetRatio) {
        drawW = maxW;
        drawH = maxW / imgRatio;
        drawY = (maxH - drawH) / 2;
      } else {
        drawH = maxH;
        drawW = maxH * imgRatio;
        drawX = (maxW - drawW) / 2;
      }

      canvas.width = maxW * 10;
      canvas.height = maxH * 10;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, drawX * 10, drawY * 10, drawW * 10, drawH * 10);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      doc.addImage(dataUrl, "JPEG", x, y, maxW, maxH);
      return maxH;
    } catch (e) {
      console.error("Failed to load image for PDF", e);
      return 0;
    }
  };

  addHeader(doc, props.trip.title);
  let currentY = 38;

  for (const entry of sortedEntries.value) {
    if (currentY > 240) {
      doc.addPage();
      addHeader(doc, props.trip.title);
      currentY = 38;
    }

    const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
      dateStyle: "long",
    });
    doc.setFontSize(14);
    doc.setTextColor(51, 122, 183);
    doc.setFont("helvetica", "bold");
    doc.text(dateStr, margin, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(entry.content, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 5;

    if (entry.photos?.length) {
      let photoX = margin;
      const photoW = (contentWidth - 4) / 3;
      const photoH = photoW * 0.75;

      for (let i = 0; i < entry.photos.length; i++) {
        if (photoX + photoW > pageWidth - margin) {
          photoX = margin;
          currentY += photoH + 2;
        }

        if (currentY + photoH > 270) {
          doc.addPage();
          addHeader(doc, props.trip.title);
          currentY = 38;
        }

        await addImageToDoc(
          entry.photos[i].url,
          photoX,
          currentY,
          photoW,
          photoH,
        );
        photoX += photoW + 2;
      }
      currentY += photoH + 10;
    } else {
      currentY += 5;
    }

    doc.setDrawColor(240, 240, 240);
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    currentY += 5;
  }

  addFooter(doc);
  doc.save(`Trip_Journal_${props.trip.title.replace(/\s+/g, "_")}.pdf`);
  toast.success("Journal exported successfully");
};
</script>
