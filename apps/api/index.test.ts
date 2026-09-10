import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { $ } from "bun";

describe("Property API Integration Tests", () => {
  let container: StartedPostgreSqlContainer;
  let dbUrl: string;
  let app: any; // We will store the Elysia app here

  beforeAll(async () => {
    // 1. Spin up the throwaway Postgres container
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    dbUrl = container.getConnectionUri();

    // 2. Override the env variable so the app uses the test DB
    process.env.DATABASE_URL = dbUrl;
    console.log(`\n🐳 Test DB running at: ${dbUrl}`);

    // 3. Push the schema to the empty test database
    console.log("📦 Pushing schema to Test DB...");
    await $`cd apps/api && bunx drizzle-kit push`;

    // 4. Dynamically import the app ONLY AFTER the test DB is ready
    const api = await import("./index");
    app = api.app;
  }, 60000);

  afterAll(async () => {
    // Destroy the container after tests complete
    if (container) {
      await container.stop();
    }
  });

  it("enforces ownership boundaries for property edits", async () => {
    // --- Step 1: Create Amir ---
    const amirRes = await app.handle(
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Amir", email: "amir@test.com", password: "password123" }),
      }),
    );
    const amirCookie = amirRes.headers.get("set-cookie") || "";

    // --- Step 2: Create Bea ---
    const beaRes = await app.handle(
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Bea", email: "bea@test.com", password: "password123" }),
      }),
    );
    const beaCookie = beaRes.headers.get("set-cookie") || "";

    // --- Step 3: Amir Creates a Property ---
    const createPropRes = await app.handle(
      new Request("http://localhost:3000/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: amirCookie, // Pass Amir's session cookie
        },
        body: JSON.stringify({
          title: "Amir Base",
          description: "No entry",
          price: 100,
          published: false,
        }),
      }),
    );
    const property = await createPropRes.json();

    // --- Step 4: The Boundary Test (Bea Tries to Edit) ---
    const patchRes = await app.handle(
      new Request(`http://localhost:3000/properties/${property.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: beaCookie, // Pass Bea's session cookie
        },
        body: JSON.stringify({ title: "Bea took over" }),
      }),
    );

    // --- Step 5: Assert the code holds the line ---
    expect(patchRes.status).toBe(404);
  });
});
