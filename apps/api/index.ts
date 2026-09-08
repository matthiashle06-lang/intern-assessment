import { Elysia, t } from "elysia";
import { db } from "./db/client";
import { enquiries, properties } from "./db/schema";

const app = new Elysia()
  // Basic health check
  .get("/", () => "Welcome to the API!")

  // GET: Fetch all properties
  .get("/properties", async () => {
    const allProperties = await db.select().from(properties);
    return allProperties;
  })

  // POST: Create a new property
  .post(
    "/properties",
    async ({ body }) => {
      try {
        const newProperty = await db
          .insert(properties)
          .values({
            name: body.title,
            description: body.description,
            price: body.price,
            ownerId: body.ownerId ?? crypto.randomUUID(),
            published: body.published ?? false,
          })
          .returning();

        return newProperty[0];
      } catch (error) {
        console.error("\n❌ DATABASE ERROR ❌");
        console.error(error);
        return { error: "Database insertion failed" };
      }
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.String(),
        price: t.Number(),
        ownerId: t.String(),
        published: t.Optional(t.Boolean()),
      }),
    },
  )

  // --- ENQUIRIES ROUTES ---
  .get("/enquiries", async () => {
    return await db.select().from(enquiries);
  })

  .post(
    "/enquiries",
    async ({ body }) => {
      try {
        const newEnquiry = await db
          .insert(enquiries)
          .values({
            propertyId: body.propertyId,
            name: body.name,
            email: body.email,
            message: body.message,
          })
          .returning();

        return newEnquiry[0];
      } catch (error) {
        console.error(error);
        return { error: "Failed to submit enquiry. Check propertyId." };
      }
    },
    {
      body: t.Object({
        propertyId: t.String(), // This must be a valid property UUID!
        name: t.String(),
        email: t.String(),
        message: t.String(),
      }),
    },
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
