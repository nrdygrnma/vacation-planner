<template>
  <div class="py-6 space-y-10">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-regular text-primary tracking-tight">
        Documentation
      </h1>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto">
        Welcome to the Vacation Planner documentation.<br />Learn how to plan,
        compare, and export your dream trips efficiently.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Quick Navigation -->
      <aside class="hidden md:block space-y-2 sticky top-4 self-start">
        <nav class="space-y-1">
          <a
            v-for="section in sections"
            :key="section.id"
            :class="
              activeSection === section.id
                ? 'bg-primary-50 text-primary border-r-4 border-primary'
                : 'text-gray-600'
            "
            :href="`#${section.id}`"
            class="block px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            {{ section.title }}
          </a>
        </nav>
      </aside>

      <!-- Content -->
      <div class="md:col-span-2 space-y-16">
        <section
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          class="scroll-mt-20"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="size-10 flex items-center justify-center bg-primary-100 rounded-lg text-primary shrink-0"
            >
              <UIcon :name="section.icon" class="size-6" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ section.title }}
            </h2>
          </div>

          <UCard shadow="sm">
            <div class="prose prose-primary max-w-none text-gray-600 space-y-4">
              <div v-html="section.content"></div>
            </div>

            <template v-if="section.subsections" #footer>
              <UAccordion :items="section.subsections">
                <template #item="{ item }: { item: DocSubsection }">
                  <div
                    class="prose prose-primary max-w-none text-gray-600 text-sm italic"
                    v-html="item.content"
                  />
                </template>
              </UAccordion>
            </template>
          </UCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface DocSubsection {
  label: string;
  icon: string;
  content: string;
}

interface DocSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  subsections?: DocSubsection[];
}

const activeSection = ref("getting-started");

const sections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "i-lucide-rocket",
    content: `
      <p>The Vacation Planner helps you organize complex itineraries, compare options, and generate professional PDF summaries.</p>
      <p><strong>First Steps:</strong></p>
      <ol class="list-decimal ml-5 space-y-2">
        <li><strong>Go to the Dashboard:</strong> Click the "Trips" link in the top navigation bar to see your current trips.</li>
        <li><strong>Create a Trip:</strong> Click the <span class="text-primary font-bold">"Create trip"</span> button. In the modal, provide a title, set the number of travelers, and choose your preferred currency.</li>
        <li><strong>Open a Trip:</strong> Click on any trip card in the grid to enter the detailed planning view.</li>
      </ol>
    `,
    subsections: [
      {
        label: "Initial Configuration",
        icon: "i-lucide-settings",
        content:
          "When creating a trip, the number of travelers and currency are crucial. The currency you select here will be used as the base for all 'Total Per Person' calculations in your summaries.",
      },
      {
        label: "Updating Trip Settings",
        icon: "i-lucide-pencil",
        content:
          "To change trip dates or travelers later, open the trip and click the 'Edit' icon near the trip title at the top of the page.",
      },
    ],
  },
  {
    id: "currencies",
    title: "Currency Management",
    icon: "i-lucide-coins",
    content: `
      <p>Managing currencies is streamlined in the Vacation Planner, focusing on EUR and USD to ensure simplicity and accuracy.</p>
      <p><strong>How it works:</strong></p>
      <ul class="list-disc ml-5 space-y-2">
        <li><strong>Access the page:</strong> Navigate to the <span class="text-primary font-bold">"Currencies"</span> page from the top navigation bar.</li>
        <li><strong>Automated Rates:</strong> Exchange rates for EUR and USD are fetched automatically upon application start via the Frankfurter API.</li>
        <li><strong>Manual Update:</strong> You can trigger a manual rate update at any time by clicking the <span class="text-primary font-bold">"Fetch Rates"</span> button on the Currencies page.</li>
      </ul>
    `,
  },
  {
    id: "flights",
    title: "Flights & Transportation",
    icon: "i-lucide-plane",
    content: `
      <p>Plan how you'll get there. You can add multiple flight and car rental options to compare prices and travel times.</p>
      <p><strong>How to manage transportation:</strong></p>
      <ul class="list-disc ml-5 space-y-2">
        <li><strong>Open Flights:</strong> Inside a trip, select the <span class="text-primary font-bold">"Flights"</span> tab. Click "Add Flight" to enter details like airline, flight number, and class.</li>
        <li><strong>Round Trips:</strong> Toggle the "Round Trip" checkbox in the flight form to add return segments.</li>
        <li><strong>Car Rentals:</strong> Switch to the <span class="text-primary font-bold">"Car Rentals"</span> tab. Here you can track providers, pick-up locations, and daily rates.</li>
        <li><strong>Selection:</strong> Click the <span class="text-primary font-bold">"Select"</span> button on a specific flight or car card to make it your 'current choice' for the trip summary.</li>
      </ul>
    `,
    subsections: [
      {
        label: "Capturing All Costs",
        icon: "i-lucide-banknote",
        content:
          "The flight form includes sections for Base Fare, Seat Selection, and Baggage fees. Fill these in to get an accurate 'Total Per Person' cost.",
      },
      {
        label: "Shared vs. Individual Costs",
        icon: "i-lucide-users",
        content:
          "In the trip header, you can toggle whether flight and car costs are split per person or are individual expenses. This is useful for group trips where one person pays for the rental car but everyone buys their own flight.",
      },
    ],
  },
  {
    id: "itinerary",
    title: "Itinerary & Stays",
    icon: "i-lucide-map",
    content: `
      <p>Build your journey stop by stop. Each stop represents a destination where you'll stay or pass through.</p>
      <p><strong>Steps to build your itinerary:</strong></p>
      <ol class="list-decimal ml-5 space-y-2">
        <li><strong>Go to Itinerary:</strong> Inside your trip, open the <span class="text-primary font-bold">"Itinerary"</span> tab.</li>
        <li><strong>Add Stops:</strong> Click "Add Stop". Give it a name (e.g., "Paris"), set the arrival and departure dates, and choose the type ("STOP" for stays, "HUB" for quick transits).</li>
        <li><strong>Add Accommodations:</strong> For each stop, click "Add Option" to list hotels, Airbnbs, or hostels.</li>
        <li><strong>Finalize:</strong> Click "Select" on your preferred accommodation for each stop to include it in your final budget.</li>
      </ol>
    `,
    subsections: [
      {
        label: "Visualizing the Route",
        icon: "i-lucide-map-pin",
        content:
          "Switch to the 'Map' tab to see your route visualized. If you've provided coordinates (Latitude/Longitude) for your stops, the map will show a driving route using real roads via OSRM.",
      },
      {
        label: "Transit Hubs",
        icon: "i-lucide-git-commit",
        content:
          "Use the 'HUB' stop type for locations where you don't need accommodation (like a long layover or a train transfer point). This keeps your itinerary chronological without requiring a hotel entry.",
      },
    ],
  },
  {
    id: "comparisons",
    title: "Trip Comparisons",
    icon: "i-lucide-layers",
    content: `
      <p>The Snapshot system allows you to save "winning" combinations of travel choices and compare them side-by-side.</p>
      <p><strong>How to use comparisons:</strong></p>
      <ul class="list-disc ml-5 space-y-2">
        <li><strong>Create a Snapshot:</strong> Once you've selected a specific flight, car, and hotels, go to the <span class="text-primary font-bold">"Comparisons"</span> tab and click "Create Snapshot". Give it a descriptive name (e.g., "Budget Option" or "Luxury Route").</li>
        <li><strong>View the Table:</strong> All your snapshots will appear in a detailed comparison table, showing differences in price and providers.</li>
        <li><strong>Smart Analysis:</strong> Click the <span class="text-primary font-bold">"Analyze"</span> button. The system will highlight the cheapest and the most convenient options for you.</li>
      </ul>
    `,
    subsections: [
      {
        label: "Why use Snapshots?",
        icon: "i-lucide-help-circle",
        content:
          "Instead of manually remembering prices, snapshots freeze your current selections. You can then change your selections to a different hotel, save another snapshot, and compare the total impact on your budget immediately.",
      },
    ],
  },
  {
    id: "exporting",
    title: "Exporting & Sharing",
    icon: "i-lucide-file-text",
    content: `
      <p>Ready to travel? Export your plans into professional PDF documents to share with partners or keep on your phone.</p>
      <p><strong>Export Options (found in Comparisons and Map tabs):</strong></p>
      <ul class="list-disc ml-5 space-y-2">
        <li><strong>Trip Info Sheet:</strong> In the "Comparisons" tab, click <span class="font-bold">"Export Selection"</span>. This generates a portrait PDF with all booking links, notes, images, and a trip map.</li>
        <li><strong>Journal Export:</strong> In the "Journal" tab, click <span class="font-bold">"Export Journal"</span> to get a beautiful narrative PDF of your trip memories.</li>
        <li><strong>Comparison Table:</strong> Click <span class="font-bold">"Export Comparison"</span> to get a landscape PDF showing all your saved snapshots side-by-side.</li>
        <li><strong>Route Details:</strong> In the "Map" tab, click the list icon to open "Route Details", then click <span class="font-bold">"Export PDF"</span>. This focuses on driving distances and travel times.</li>
      </ul>
    `,
    subsections: [
      {
        label: "Interactive Links",
        icon: "i-lucide-mouse-pointer-click",
        content:
          "All PDF exports include clickable booking links. If you added a URL for a flight or hotel, you can tap it directly in the PDF to open the booking page.",
      },
    ],
  },
  {
    id: "journal",
    title: "Trip Journal",
    icon: "i-lucide-book-marked",
    content: `
      <p>Keep a daily diary of your adventures. The Trip Journal allows you to write notes and attach photos for every day of your journey.</p>
      <p><strong>How to use the Journal:</strong></p>
      <ul class="list-disc ml-5 space-y-2">
        <li><strong>Open Journal:</strong> Select the <span class="text-primary font-bold">"Journal"</span> tab in the trip planning view.</li>
        <li><strong>Add Entry:</strong> Click "Add Entry". Choose a date, write your thoughts, and optionally add URLs for photos you've taken.</li>
        <li><strong>Timeline View:</strong> Your entries are automatically sorted chronologically in a beautiful timeline.</li>
        <li><strong>Export:</strong> Click "Export Journal" to generate a narrative PDF of your diary.</li>
      </ul>
    `,
    subsections: [
      {
        label: "Photo Captions",
        icon: "i-lucide-type",
        content:
          "You can add optional captions to each photo to remember specific details about the moment.",
      },
    ],
  },
];

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -50% 0px" },
  );

  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (el) observer.observe(el);
  });

  // Ensure "Getting Started" is highlighted on load if we are at the top
  if (window.scrollY < 100) {
    activeSection.value = "getting-started";
  }
});
</script>

<style scoped>
.prose p {
  margin-bottom: 1rem;
}
</style>
