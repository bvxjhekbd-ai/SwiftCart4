import { db } from "./db";
import { categories } from "@shared/schema";

const defaultCategories = [
  "Instagram",
  "Twitter",
  "TikTok",
  "YouTube",
  "Facebook",
  "LinkedIn",
];

async function seedCategories() {
  console.log("Seeding categories...");
  
  for (const name of defaultCategories) {
    try {
      await db.insert(categories).values({ name }).onConflictDoNothing();
      console.log(`✓ Added category: ${name}`);
    } catch (error) {
      console.log(`✗ Failed to add category ${name}:`, error);
    }
  }
  
  console.log("Categories seeded successfully!");
  process.exit(0);
}

seedCategories().catch((error) => {
  console.error("Error seeding categories:", error);
  process.exit(1);
});
