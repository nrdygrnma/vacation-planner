import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Listing all journals entries to debug...");

  const entries = await prisma.journalEntry.findMany();
  console.log(`Found ${entries.length} entries in database.`);

  for (const entry of entries) {
    console.log(`Entry ID: ${entry.id}`);
    console.log(`Content snippet: ${entry.content.substring(0, 100)}...`);
    if (entry.content.includes("/uploads/")) {
      console.log("  CONTAINS /uploads/");
      if (entry.content.includes(" ")) {
        console.log("  CONTAINS SPACE");
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
