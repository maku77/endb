# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EnDB is an English vocabulary learning application built with:
- **Backend**: Cloudflare Workers + D1 (SQLite) + Hono framework
- **Frontend**: SvelteKit + TypeScript + SCSS
- **Package Manager**: pnpm

## Common Commands

### Backend (Cloudflare Workers)

```bash
cd backend
pnpm dev              # Start development server on http://localhost:8787
pnpm deploy           # Deploy to Cloudflare Workers
pnpm db:migrate       # Run migrations on production D1
pnpm db:migrate:local # Run migrations on local D1
```

### Frontend (SvelteKit)

```bash
cd frontend
pnpm dev              # Start development server on http://localhost:5173
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # Type-check with svelte-check
pnpm check:watch      # Type-check in watch mode
```

## Architecture

### Backend Structure

The backend uses **Hono** framework with modular route handlers:

- **index.ts**: Main app with CORS configuration and route mounting
- **db.ts**: Database abstraction layer with all SQL queries
- **types.ts**: TypeScript type definitions for domain models and API requests
- **routes/**: Domain-specific route handlers
  - `words.ts`: Word CRUD operations
  - `categories.ts`: Category management
  - `study.ts`: Study session and random word selection
  - `stats.ts`: Statistics aggregation

**Key Pattern**: All database operations are centralized in `db.ts` as exported functions. Route handlers in `routes/` import these functions and handle HTTP concerns (validation, error handling, response formatting).

### Frontend Structure

SvelteKit app with API client pattern:

- **lib/api.ts**: Centralized API client with typed functions for all backend endpoints
- **lib/types.ts**: Frontend type definitions (should mirror backend types)
- **lib/components/**: Reusable Svelte components
- **routes/**: File-based routing (SvelteKit convention)

**Key Pattern**: All API calls go through `lib/api.ts` functions. Components never call `fetch` directly.

### Database Schema

Three main tables:
- **words**: Vocabulary entries with learning metrics (review_count, correct_count, mastery_level 0-5)
- **categories**: Organizational tags with color coding
- **study_sessions**: Historical record of all study attempts

**Important**: The `mastery_level` field (0-5) is automatically updated based on study results. Correct answers increment (max 5), incorrect answers decrement (min 0).

## Development Workflow

1. **Backend changes**: Modify routes or add database functions in `backend/src/`
2. **Database changes**: Create new migration SQL files in `backend/migrations/` with sequential numbering
3. **Frontend changes**: Update API client in `frontend/src/lib/api.ts` if backend API changes
4. **Type sync**: Keep `frontend/src/lib/types.ts` in sync with `backend/src/types.ts`

## Configuration Notes

- Backend listens on port 8787 (Wrangler default)
- Frontend expects backend at `http://localhost:8787` (hardcoded in `frontend/src/lib/api.ts`)
- CORS is configured to allow all origins in development (`backend/src/index.ts`)
- D1 database binding name is `DB` (configured in `wrangler.toml`)

## Important Implementation Details

- **Mastery Level Algorithm**: In `backend/src/db.ts:recordStudySession()`, correct answers add 1 to mastery_level (capped at 5), incorrect answers subtract 1 (floored at 0)
- **Dynamic SQL Queries**: Both `updateWord` and `updateCategory` functions build dynamic SQL with only the provided fields
- **Foreign Key Cascades**: Deleting a category sets word.category_id to NULL; deleting a word cascades to study_sessions
