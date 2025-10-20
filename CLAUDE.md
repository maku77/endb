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
- **Authentication**: JWT-based authentication protects word/category creation, update, and deletion. Read operations remain public.

## Svelte 5 Coding Standards

This project uses **Svelte 5** with the modern **Runes API**. Follow these guidelines when writing Svelte components:

### Reactive State Management

**Use Runes API (Svelte 5)** instead of legacy stores for component-level state:

```svelte
<script lang="ts">
  // ✅ CORRECT: Use $state() for reactive variables
  let count = $state(0);
  let user = $state({ name: 'Alice', age: 30 });

  // ✅ CORRECT: Use $derived() for computed values
  let doubled = $derived(count * 2);
  let greeting = $derived(`Hello, ${user.name}!`);

  // ✅ CORRECT: Use $effect() for side effects
  $effect(() => {
    console.log(`Count changed to: ${count}`);
  });
</script>

<!-- ❌ WRONG: Don't use legacy reactive declarations -->
<!-- $: doubled = count * 2 -->
```

### Component Props

**Use $props() rune** for component properties:

```svelte
<script lang="ts">
  // ✅ CORRECT: Destructure props with $props()
  let { title, count = 0, onUpdate } = $props<{
    title: string;
    count?: number;
    onUpdate?: (value: number) => void;
  }>();

  // ✅ CORRECT: Use $bindable() for two-way binding
  let { value = $bindable(0) } = $props<{ value?: number }>();
</script>

<!-- ❌ WRONG: Don't use export let -->
<!-- export let title: string; -->
```

### Event Handlers

Use standard DOM event handling without custom event dispatchers:

```svelte
<script lang="ts">
  let { onSubmit } = $props<{
    onSubmit?: (data: FormData) => void;
  }>();

  function handleSubmit() {
    const data = new FormData();
    onSubmit?.(data);
  }
</script>

<button onclick={handleSubmit}>Submit</button>

<!-- ❌ WRONG: Don't use createEventDispatcher -->
```

### Stores (When to Use)

Use **Svelte stores** only for **global state** that needs to be shared across multiple components:

```typescript
// ✅ CORRECT: Use stores for global state like authentication
// frontend/src/lib/stores/auth.ts
import { writable } from 'svelte/store';

export const authStore = writable<string | null>(null);
```

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth';

  // ✅ CORRECT: Subscribe to stores with $ prefix
  let isLoggedIn = $derived($authStore !== null);
</script>
```

**Note**: For component-local state, always prefer `$state()` over stores.

### TypeScript Integration

Always use TypeScript with proper type annotations:

```svelte
<script lang="ts">
  import type { Word } from '$lib/types';

  let { words } = $props<{ words: Word[] }>();
  let selectedWord = $state<Word | null>(null);
  let filteredWords = $derived(
    words.filter(w => w.mastery_level < 3)
  );
</script>
```

### Component Structure Best Practices

1. **State declarations** at the top
2. **Derived values** after state
3. **Effects** after derived values
4. **Functions** at the bottom of script block

```svelte
<script lang="ts">
  // 1. Props
  let { initialCount = 0 } = $props<{ initialCount?: number }>();

  // 2. State
  let count = $state(initialCount);
  let items = $state<string[]>([]);

  // 3. Derived values
  let doubled = $derived(count * 2);
  let isEmpty = $derived(items.length === 0);

  // 4. Effects
  $effect(() => {
    console.log('Count:', count);
  });

  // 5. Functions
  function increment() {
    count++;
  }

  function addItem(item: string) {
    items = [...items, item];
  }
</script>
```

### Migration Notes

If you encounter **legacy Svelte 4 syntax** in existing components:

- `export let prop` → `let { prop } = $props()`
- `$: derived = expression` → `let derived = $derived(expression)`
- `$: { effect }` → `$effect(() => { effect })`
- Component stores → Consider if global state is needed, otherwise use `$state()`

### Key Differences from Svelte 4

| Svelte 4 | Svelte 5 |
|----------|----------|
| `export let count = 0` | `let { count = 0 } = $props()` |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `$: { console.log(count) }` | `$effect(() => console.log(count))` |
| `let count = 0` (not reactive) | `let count = $state(0)` |
| `createEventDispatcher()` | Pass callbacks via props |
