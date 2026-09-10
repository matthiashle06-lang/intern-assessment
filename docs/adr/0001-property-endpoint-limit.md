# 1. Enforcing Ownership on the Property Endpoint

**Date:** 2026-09-10
**Status:** Accepted

## Context

The project architecture strictly limits the API to exactly six endpoints. We needed a way to populate a logged-in owner's dashboard with their specific properties (both published and unpublished) without exposing private properties to the public, and without fetching all rows to filter them on the frontend.

## Alternative Rejected

We initially attempted to create a 7th endpoint (`GET /properties/me`) specifically for the dashboard. This was rejected because:

1. It explicitly violated the 6-endpoint limit constraint.
2. It caused a routing collision with the dynamic `GET /properties/:id` route, resulting in a 500 Internal Server Error when the router interpreted "me" as an ID.

## Decision

We decided to modify the existing `GET /properties` endpoint to serve dual purposes by enforcing ownership directly in the database query. We implemented a Drizzle `or` condition: if a user is authenticated, the query returns properties that are EITHER `published: true` OR `ownerId: user.id`. If no user is authenticated, it strictly returns `published: true`.

## Consequences

- **Positive:** We stayed within the 6-endpoint limit while securing the ownership boundary directly at the database level.
- **Negative:** The single endpoint's logic is slightly more complex, and the frontend dashboard must share the same fetch URL as the public homepage.
