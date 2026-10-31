# Copilot Instructions for Mona Mayhem

## Project overview
This repository is a workshop starter for building Mona Mayhem, a retro arcade GitHub Contribution Battle Arena. The goal is to compare contribution activity for two GitHub users in a playful, game-like interface.

Treat the `workshop/` directory as instructional material only. It is not part of the app implementation unless a task explicitly requires reading it for guidance.

## Tech stack
- Astro
- Node.js
- TypeScript / JavaScript
- Tailwind CSS for layout and utility styling when appropriate
- Scoped component CSS for component-specific visual polish

## Product goals
- Build a fun retro arcade experience inspired by classic game UI
- Compare GitHub contribution data between two users
- Present a clear battle view with a strong visual hierarchy
- Keep the project approachable, readable, and easy to extend

## Coding standards
- Favor clean, readable code over clever abstractions.
- Keep components modular and focused on a single concern.
- Follow the existing file naming conventions already used in the repo:
  - page and route files under `src/pages/`
  - reusable UI in `src/components/` with clear, descriptive names
  - server/API logic in `src/pages/api/...`
- Prefer TypeScript for logic-heavy code; use JavaScript only when a file is intentionally lightweight or matches an existing pattern.
- Keep helper functions small and obvious; avoid over-engineering for simple tasks.
- Prefer semantically clear names, direct logic, and simple data flows.

## Styling guidance
- Prefer Tailwind utilities for layout and reusable patterns when they make the code cleaner.
- Use scoped CSS for visual styling that is component-specific or harder to express with utilities.
- Keep styles maintainable and avoid large one-off CSS blocks.
- Preserve a consistent retro arcade look across pages and components.

## Architecture guidance
- Use Astro pages and components for the UI layer.
- Keep API concerns in route handlers under `src/pages/api/`.
- Keep data fetching and transformation separate from rendering.
- Prefer small, composable pieces over a single giant page component.
- Match the existing route and file structure rather than introducing a different architecture pattern.

## Implementation expectations
- Preserve the workshop project goal: a contribution comparison app with a game-like “battle” theme.
- Add functionality in small, verifiable increments.
- Validate changes against the app's expected behavior and avoid broad refactors for unrelated cleanup.
- If there is uncertainty, prefer the simplest implementation that fits the existing architecture and project conventions.

## Output expectations
When editing this repository, be surgical and explicit:
- do not create unnecessary files or folders
- do not add layers of abstraction that are not justified by the task
- do not rewrite working code just to be clever
- do not ignore the existing Astro structure and naming patterns

The default is to build simple, maintainable, modular code that is easy for the next developer to understand.
