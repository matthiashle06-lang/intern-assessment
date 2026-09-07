import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => "Welcome to the Intern Assessment API!")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
