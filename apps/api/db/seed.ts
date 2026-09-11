import { db } from "./client";
import { properties } from "./schema";
import { auth } from "../auth";

// Seeds demo owners and sample properties for local testing.
async function main() {
  console.log("Seeding database...");

  // Create Owners using Better Auth (This handles hashing and tables automatically!)
  const amirData = await auth.api.signUpEmail({
    headers: new Headers(),
    body: {
      name: "Amir",
      email: "amir@test.com",
      password: "password123",
    },
  });

  const beaData = await auth.api.signUpEmail({
    headers: new Headers(),
    body: {
      name: "Bea",
      email: "bea@test.com",
      password: "password123",
    },
  });

  console.log("Created owners Amir and Bea with passwords");

  // Create Properties using the new User IDs
  await db.insert(properties).values([
    {
      name: "Amir's Published Villa",
      description: "A beautiful place anyone can see.",
      price: 1500,
      published: true,
      ownerId: amirData.user.id,
    },
    {
      name: "Amir's Secret Base",
      description: "Bea should NEVER be able to see or edit this.",
      price: 9999,
      published: false,
      ownerId: amirData.user.id,
    },
  ]);

  await db.insert(properties).values([
    {
      name: "Bea's Public Studio",
      description: "Available for rent.",
      price: 800,
      published: true,
      ownerId: beaData.user.id,
    },
  ]);

  console.log("Properties seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
