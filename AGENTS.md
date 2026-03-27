# Project Coding Guidelines

This document provides coding standards and guidelines for AI agents working in this Next.js barbershop booking application.

## 1. General Principles

- **English Only:** All code, comments, commits, and documentation must be in English.
- **KISS:** Keep It Simple, Stupid. Prefer clarity over cleverness.
- **Package Manager:** Use **Bun** exclusively (never npm or yarn).

## 2. Build, Lint, and Test Commands

### Development
```bash
bun run dev          # Start Next.js development server
bun run build        # Build for production (runs prisma generate first)
bun run start        # Start production server
bun run lint         # Run ESLint
```

### Testing (Jest)
```bash
bun run test                              # Run all tests (CORRECT)
bun run test:watch                        # Run tests in watch mode
bun run test -- path/to/file.test.ts      # Run a single test file
bun run test -- --testNamePattern="test name"  # Run tests matching pattern
bun run test -- path/to/file.test.ts --testNamePattern="specific test"  # Single test in file
```

> **⚠️ IMPORTANT:** Always use `bun run test`, NOT `bun test`.
> - `bun run test` → Runs Jest (correct)
> - `bun test` → Runs Bun's native test runner (incompatible with Jest mocks)

### Database (Prisma + Docker)
```bash
make db-up           # Start Postgres container
make down            # Stop infrastructure
make clean           # Stop and remove volumes
make db-migrate      # Create new migration (interactive)
make studio          # Open Prisma Studio
make setup           # Full project setup (db + install + migrate)
bun run db:seed:user # Seed user data
bunx prisma db seed  # Run main seed script
```

### Package Management
```bash
bun add <package>        # Add dependency
bun add -d <package>     # Add dev dependency
bun install              # Install all dependencies
```

## 3. Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── _actions/        # Server Actions (use "use server" directive)
│   ├── api/             # API route handlers
│   ├── [slug]/          # Dynamic barbershop pages
│   └── dashboard/       # Dashboard pages
├── components/
│   ├── ui/              # shadcn/ui components (do not modify directly)
│   └── landing/         # Landing page components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── lib/
│   ├── utils.ts         # Utility functions (cn for classnames)
│   ├── prisma.ts        # Prisma client instance
│   ├── supabase.ts      # Supabase client
│   └── utils/           # Additional utilities
├── services/            # API service layer (Axios-based)
└── types/               # TypeScript type definitions
```

## 4. API Communication (Axios)

- **Never use bare fetch:** Always use the configured Axios instance from `@/services/api`.
- **Service Pattern:** Encapsulate API calls in service files, not components.

```typescript
// Good - in services/barberService.ts
export const BarberService = {
  getProfileBySlug: async (slug: string, apiClient = api) => {
    const { data } = await apiClient.get<BarberShopData>(`/barber/${slug}`);
    return data;
  },
};

// Bad - in a component
useEffect(() => {
  axios.get('/api/barber/...'); // Never do this
}, []);
```

- **Type Safety:** Always use Axios generics: `axios.get<ResponseType>(...)`.
- **Error Handling:** Use try/catch with proper logging.

## 5. TypeScript Rules

- **No `any`:** Strictly forbidden. Define interfaces for all data structures.
- **Strict Mode:** `tsconfig.json` has `"strict": true` enabled.
- **Path Aliases:** Use `@/*` for imports from `src/*`.

```typescript
// Good
import { cn } from "@/lib/utils";
import { BarberService } from "@/services/barberService";

// Bad
import { cn } from "../../lib/utils";
```

## 6. Testing Guidelines

- **Framework:** Jest with React Testing Library.
- **File Naming:** Use `.test.ts` or `.test.tsx` suffix, co-located with source.
- **Mock External Dependencies:** Always mock Prisma, Axios, and external services.

```typescript
// Example test pattern
const mockGet = jest.fn();
const fakeApi = { get: mockGet } as any;

describe("ServiceName.methodName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should do something", async () => {
    mockGet.mockResolvedValue({ data: mockData });
    const result = await Service.method("param", fakeApi);
    expect(result).toBeDefined();
  });
});
```

## 7. React & Next.js Patterns

### Server Actions
- Place in `src/app/_actions/` directory.
- Always include `"use server"` directive at top.
- Return typed response objects with status codes.

```typescript
interface ServerActionResponse {
  status: 200 | 400 | 409 | 500;
  message: string;
  data?: any;
}
```

### Components
- Use function components with TypeScript.
- UI components from shadcn/ui are in `src/components/ui/`.
- Use `cn()` utility for conditional classnames.

```typescript
import { cn } from "@/lib/utils";

function MyComponent({ className }: { className?: string }) {
  return <div className={cn("base-classes", className)} />;
}
```

### Context Providers
- Located in `src/contexts/`.
- Wrap app in `ThemeProvider`, `AuthProvider`, `I18nProvider`.

## 8. Styling

- **Tailwind CSS v4:** Primary styling solution.
- **CSS Variables:** Used for theming (dark/light mode).
- **shadcn/ui:** Component library (New York style variant).
- **No inline styles:** Use Tailwind classes or CSS modules.

## 9. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `BookingSheet.tsx` |
| Files (utilities) | camelCase | `timeSlot.ts` |
| Files (tests) | match source + `.test` | `barberService.test.ts` |
| Variables/Functions | camelCase | `getProfileBySlug` |
| Interfaces/Types | PascalCase | `BarberShopData` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| React Components | PascalCase | `function BookingForm()` |
| Hooks | use prefix | `useProtectedRoute` |
| Context | suffix with Context/Provider | `AuthContext`, `ThemeProvider` |

## 10. Error Handling

- Use try/catch in all async operations.
- Log errors with `console.error` for server-side debugging.
- Return user-friendly error messages, not raw errors.

```typescript
try {
  const result = await someOperation();
  return { status: 200, data: result };
} catch (error) {
  console.error("Operation failed:", error);
  return { status: 500, message: "Something went wrong" };
}
```

## 11. Git Commit Strategy

**Format:** `type(scope): message`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

**Examples:**
```
feat(booking): add time slot conflict detection
fix(api): handle null barber profile gracefully
test(services): add barberService unit tests
ci(docker): add multi-stage dockerfile
```

## 12. Environment Variables

- Copy `example.env` to `.env` for local development.
- Required: `NEXT_PUBLIC_APP_URL`, database connection strings.
- Never commit `.env` files.

## 13. Database

- **ORM:** Prisma with PostgreSQL.
- **Schema:** Located at `prisma/schema.prisma`.
- **Migrations:** Run `make db-migrate` after schema changes.
- **Client:** Import from `@/lib/prisma`.
