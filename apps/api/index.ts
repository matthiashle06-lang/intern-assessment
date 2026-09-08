import { Elysia, t } from "elysia";
import { db } from "./db/client";
import { enquiries, properties } from "./db/schema";
import { auth } from "./auth";
import { eq, and } from "drizzle-orm";
import type { Context } from "elysia";

const app = new Elysia()
  // --- AUTH & MIDDLEWARE ---
  .mount(auth.handler)
  .derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    // FIX 1: Map to a simple, strict object so TypeScript doesn't choke on the Drizzle types.
    return { 
      user: session?.user ? { id: session.user.id } : null 
    };
  })

  // --- PUBLIC ROUTES ---
  .get("/properties", async () => {
    return await db.select().from(properties).where(eq(properties.published, true));
  })

  .get("/properties/:id", async ({ params: { id }, user, set }) => {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    const property = result[0];

    if (!property || (!property.published && property.ownerId !== user?.id)) {
      set.status = 404;
      return { error: "Property not found or not published" };
    }
    return property;
  })

  // --- PROTECTED ROUTES ---
  .post("/properties", async ({ body, user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    try {
      const newProperty = await db.insert(properties).values({
        name: body.title, 
        description: body.description,
        price: body.price,
        ownerId: user.id, 
        published: body.published ?? false,
      }).returning();

      return newProperty[0];
    } catch (error) {
      console.error(error);
      set.status = 500;
      return { error: "Database insertion failed" };
    }
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      price: t.Number(),
      published: t.Optional(t.Boolean()),
    }),
  })
  
  .patch("/properties/:id", async ({ params: { id }, body, user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    
    const updated = await db.update(properties)
      .set({
        name: body.title,
        description: body.description,
        price: body.price,
        published: body.published
      })
      .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)))
      .returning();
      
    if (updated.length === 0) {
      set.status = 404;
      return { error: "Property not found or unauthorized" };
    }
    return updated[0];
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
      price: t.Optional(t.Number()),
      published: t.Optional(t.Boolean())
    })
  })

  .get("/enquiries", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    
    return await db.select({
      id: enquiries.id,
      name: enquiries.name,
      email: enquiries.email,
      message: enquiries.message,
      propertyId: enquiries.propertyId,
    })
    .from(enquiries)
    .innerJoin(properties, eq(enquiries.propertyId, properties.id))
    .where(eq(properties.ownerId, user.id));
  })

// --- ISOLATED THROTTLED ROUTE (Custom Native Throttling) ---
  .group("/properties/:id", (app) => {
    // In-memory store for rate limiting (Resets if server restarts)
    const rateLimitMap = new Map<string, { count: number, startTime: number }>();

    return app
      .onBeforeHandle(({ request, set }) => {
        // Use IP or fallback to a default string if IP parsing fails
        const ip = app.server?.requestIP(request)?.address || "unknown-ip";
        const now = Date.now();
        const record = rateLimitMap.get(ip) || { count: 0, startTime: now };
        
        // 60-second window
        if (now - record.startTime > 60000) {
          record.count = 1;
          record.startTime = now;
        } else {
          record.count++;
        }
        
        rateLimitMap.set(ip, record);
        
        // 3 requests max
        if (record.count > 3) {
          set.status = 429;
          return { error: "Too Many Requests" };
        }
      })
      .post("/enquiries", async ({ params: { id }, body, set }: { params: { id: string }; body: { name: string; email: string; message: string }; set: Context['set'] }) => {
        try {
          const newEnquiry = await db.insert(enquiries).values({
            propertyId: id,
            name: body.name,
            email: body.email,
            message: body.message,
          }).returning();
          return newEnquiry[0];
        } catch (error) {
          set.status = 500;
          return { error: "Failed to submit enquiry" };
        }
      }, {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          message: t.String(),
        }),
      });
  })

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);