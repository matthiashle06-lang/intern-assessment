# AI Usage Record

## What was delegated
- Generating repetitive UI boilerplate and Tailwind CSS layouts for the dashboard and forms.
- Debugging network-level configuration, specifically setting up the Elysia CORS plugin to allow the Next.js frontend to securely pass Better Auth session cookies.
- Translating complex TypeScript DOM environment clashes into plain English to understand root causes.
- Writing the specific Drizzle ORM logic to enforce ownership directly in the database query.
- Writing a custom, lightweight throttling system natively in Elysia.

## Where the agent was wrong
- When asked to isolate the owner's properties for the dashboard, the AI agent hallucinated a solution that involved creating a 7th endpoint (`GET /properties/me`). It failed to consider the strict architectural constraints of the project (the 6-endpoint limit) and caused a routing collision that crashed the API with a 500 error. 

## One thing I rejected
I explicitly rejected the AI's suggestion to use `// @ts-expect-error` or `as any` to quickly silence compiler warnings when Bun's backend types clashed with Next.js frontend event types (e.g., `FormData` and `HTMLInputElement`). Instead, I chose to completely refactor the forms to use strict React state and proper `React.SyntheticEvent` typing to ensure the CI/CD pipeline passed legitimately.