# Project Coding Guidelines

## 1. General Principles
* **English Only:** Code, comments, commits, and docs must be in English.
* **KISS:** Keep It Simple, Stupid.
* **Package Manager:** Use **Bun** exclusively.
    * Run: `bun run dev`
    * Install: `bun add <package>`
    * Test: `bun test` or `bun run test` (mapped to Jest).

## 2. API Communication (Axios)
* **No bare fetch:** Always use the configured Axios instance.
* **Service Pattern:** API calls should be encapsulated in service files, not inside components.
    * *Good:* `await BarberService.getProfile(id)`
    * *Bad:* `axios.get('/api/barber/...')` inside `useEffect`.
* **Error Handling:** Use `try/catch` blocks and leverage Axios interceptors for global error logging.

## 3. Testing (Jest)
* **Requirement:** Every complex utility function or critical component *must* have a corresponding `.test.tsx` or `.spec.ts` file.
* **Mocking:** Mock external dependencies (Prisma, Axios) to isolate unit tests.
* **Naming:** Test files must be co-located with the source file or in a `__tests__` directory.

## 4. TypeScript Rules
* **No `any`:** Strictly forbidden. Define Interfaces for all API responses coming via Axios.
* **Type Safety:** Ensure Axios generics are used: `axios.get<BarberProfile>(...)`.

## 5. Documentation & Logging
* **Self-Documenting Code:** Variables describe *what*, comments describe *why*.
* **Verbose Logging:** `console.log` important steps in API routes for server-side debugging.

## 6. Commit Strategy
* **Format:** `type(scope): message`
    * Example: `feat(api): add axios interceptor for auth headers`
    * Example: `ci(docker): add multi-stage dockerfile`  