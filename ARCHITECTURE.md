# Mona Mayhem Architecture

## Overview
This project is an Astro application for a contribution-comparison experience. It combines static page rendering with route-based API functionality to fetch and display GitHub contribution data.

## Tech stack
- Astro for pages, routing, and component composition
- Node.js runtime
- TypeScript or JavaScript for app logic
- Tailwind CSS and/or scoped component CSS for styling

## High-level structure
- `src/pages/` — route-driven pages and API endpoints
- `src/components/` — reusable UI building blocks
- `public/` — static assets
- `docs/` — supporting documentation
- `workshop/` — workshop guidance and exercises
- `.github/` — repo automation and Copilot guidance

## Routing conventions
- Page routes live under `src/pages/`
- API endpoints live under `src/pages/api/` and use Astro route handlers
- Parameters and dynamic routes follow Astro conventions such as `[username].ts`

## UI architecture
The app should be structured so that each major piece of the interface is a focused component rather than a monolithic page.

Recommended patterns:
- page components for layout and composition
- small UI components for cards, headers, stats, and controls
- helper modules for formatting or data shaping when reuse warrants it
- a clear separation between data fetching, transformation, and rendering

## Styling approach
- Use Tailwind utilities when they simplify layout and reduce repetitive CSS
- Use scoped CSS for visual details or styles tied to one component
- Keep the styling layered and predictable rather than deeply nested or overly clever

## Data flow
1. User enters or selects GitHub users
2. App requests contribution data from the API layer
3. Server route fetches/normalizes GitHub contribution information
4. Page renders battle-oriented comparisons and summary metrics

## Implementation principles
- Keep modules small and composable
- Prefer direct, readable logic over generic abstractions
- Follow existing naming and folder patterns in the repo
- Add only the necessary complexity to support the feature at hand
- Do not refactor unrelated code just to optimize for hypothetical future cases

## Expected result
The codebase should remain approachable enough for workshop participants and extensible enough for iterative feature work while preserving the retro arcade theme and simple Astro structure.
