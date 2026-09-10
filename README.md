# Property Management Platform

A full-stack property management dashboard with strictly enforced ownership boundaries. Built with a decoupled architecture featuring a Next.js frontend and an Elysia API.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Elysia.js (Bun)
- **Database & ORM:** PostgreSQL (via Docker), Drizzle ORM
- **Authentication:** Better Auth

## Prerequisites

Ensure you have the following installed before proceeding:

- [Bun](https://bun.sh/) (v1.0+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
- Git

## Quick Start (10-Minute Setup)

Follow these exact steps to get a fresh instance of the application running locally.

**1. Clone the repository**

```bash
git clone https://github.com/matthiashle06-lang/intern-assessment
cd intern-assessment
```

**2. Install dependencies**

```bash
bun install
```

The root `dev` script uses `concurrently` to run the frontend and API together. If it is not already installed, add it to the root workspace with:

```bash
bun add --dev concurrently
```

**3. Environment Variables**
Copy the example environment file and ensure the default values are set:

```bash
copy .env.example .env
```

**4. Start the Database & Apply Schema**
Make sure docker is running on your machine, then execute:

```bash
docker compose up -d
bun run db:push
```

**5. Seed the database**
This will populate the database with properties and create test users

```bash
bun run db:seed
```

**6. Start the Application**
Boot the frontend and the API concurrently

```bash
bun run dev
```

The frontend will be available at http://localhost:3000 and the API at http://localhost:3001.

**TESTING THE OWNERSHIP BOUNDARY**

Owner 1 (Amir)

    Email: amir@test.com

    Password: password123

Owner 2 (Bea)

    Email: bea@test.com

    Password: password123

**DOCUMENTATION**

Architectural Decisions: See docs/adr/0001-property-endpoint-limit.md for details on how the 6-endpoint limit constraint was resolved.

AI Usage: See docs/ai-usage.md for a transparent log of AI assistance during development.
