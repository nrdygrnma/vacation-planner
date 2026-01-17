import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating journals entries to fix image URLs with spaces...");

  const entries = await prisma.journalEntry.findMany();
  console.log(`Found ${entries.length} entries.`);

  let updatedCount = 0;

  for (const entry of entries) {
    let newContent = entry.content;

    // Replace all /uploads/ URLs that have spaces
    // We match /uploads/ followed by any non-delimiters that include spaces
    // Regexp to find URLs with spaces specifically inside /uploads/ context
    const matches = entry.content.match(
      /\/uploads\/[^"'\)\s>]*\s+[^"'\)\s>]*/g,
    );

    if (matches) {
      console.log(`Entry ${entry.id} matches URLs with spaces`);
      let currentEntryChanged = false;
      for (const match of matches) {
        const fixed = match.replace(/\s+/g, "-");
        newContent = newContent.split(match).join(fixed);
        currentEntryChanged = true;
        console.log(`  Replacing "${match}" with "${fixed}"`);
      }

      if (currentEntryChanged) {
        await prisma.journalEntry.update({
          where: { id: entry.id },
          data: { content: newContent },
        });
        updatedCount++;
      }
    }
  }

  console.log(`Updated ${updatedCount} journal entries.`);

  console.log("Checking JournalPhoto table...");
  const photos = await prisma.journalPhoto.findMany();
  let updatedPhotos = 0;
  for (const photo of photos) {
    if (photo.url.includes("/uploads/") && photo.url.includes(" ")) {
      const newUrl = photo.url.replace(/\s+/g, "-");
      await prisma.journalPhoto.update({
        where: { id: photo.id },
        data: { url: newUrl },
      });
      updatedPhotos++;
      console.log(`Updated photo ${photo.id}: ${photo.url} -> ${newUrl}`);
    }
  }
  console.log(`Updated ${updatedPhotos} photos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
