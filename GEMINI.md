# GEMINI.md - Project Context & Instructions

## Project Overview
**Grid** is a multi-tenant SaaS platform for barbershops. It allows shop owners to create professional booking websites with organized scheduling, international phone validation, and automated appointment management.

### Read first:
- **docs/spec.md**
- **docs/saas-architecture.md**
- **docs/QUICK_REFERENCE.md**

### Behavior:
- Always read **docs/spec.md** before implementing a feature.
- If the task is ambiguous, ask 1 clarifying question before coding.
- Before editing files, briefly summarize the implementation plan.
- Prefer small, incremental changes over broad refactors.

### Do not:
- Do not modify .env files.
- Do not touch database migrations unless the task explicitly requires it.
- Do not change business rules without updating **docs/spec.md.**
- Do not introduce new libraries without justification.

### Validation:
- Run tests after meaningful changes.
- Update or add tests for critical flows.
- Ensure TypeScript types are strict and explicit.

### Rules:
- **Use bun as package manager and runtime**
- **Follow the /AGENTS.md**
- **Use Axios, never bare fetch**
- **Write tests for critical changes**
- **Before implementing a big feature, present a short plan**

### Core Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Runtime:** Bun
- **Language:** TypeScript (Strict)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Supabase Auth
- **Payments:** Stripe (Checkout + Webhooks)
- **Styling:** Tailwind CSS + Shadcn UI
- **Testing:** Jest + React Testing Library

## Architectural Patterns
- **Multi-tenancy:** Uses slug-based routing (e.g., `/{slug}`) for public shop pages.
- **Service Pattern:** All API and external communications must be encapsulated in `src/services/`.
- **Server Actions:** Used for database mutations and complex business logic (e.g., `src/app/_actions/`).
- **Validation:** Strict international phone validation via `lib/utils/phone-validation.ts`.
- **Error Handling:** Unified approach using Sonner toasts and structured server responses (HTTP status codes in return objects).

## Directory Structure
- `src/app/`: Next.js App Router (Public and Protected routes).
- `src/app/_actions/`: Server Actions for bookings and availability.
- `src/components/`: Shared UI components (Radix/Shadcn).
- `src/services/`: API wrappers and business logic services.
- `src/lib/`: Library initializations (Prisma, Supabase, Stripe) and utilities.
- `prisma/`: Database schema, migrations, and seed scripts.

## Development Workflow

### Building and Running
- **Install:** `bun install`
- **Dev Server:** `bun run dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint`

### Database Management
- **Migrate:** `bunx prisma migrate dev`
- **Seed:** `bunx prisma db seed`
- **Studio:** `bunx prisma studio`
- **Generate Client:** `bunx prisma generate`

### Testing
- **Run all:** `bun test`
- **Watch mode:** `bun test:watch`

## Coding Standards & Conventions
- **Language:** All code, comments, and user-facing error messages must be in **English**.
- **Typing:** Avoid `any`. Use strict TypeScript interfaces/types for all data structures.
- **Simplicity:** Adhere to the **KISS** (Keep It Simple, Stupid) principle.
- **Validation:** Always validate user input on both client and server sides.
- **Consistency:** Use Sonner for all toast notifications. Do not use `alert()` or `console.log` for user feedback.
- **Atomic Commits:** Follow the project's existing commit style (check `git log` for reference).

## Key Business Rules
- **Barbers:** Max 10 per shop. Required: Name, Phone.
- **Services:** Max 20 per shop. Required: Name, Price, Duration.
- **Slugs:** Unique, 3-50 chars, lowercase alphanumeric + hyphens.
- **Bookings:** Must be within business hours (09:00 - 19:30).
