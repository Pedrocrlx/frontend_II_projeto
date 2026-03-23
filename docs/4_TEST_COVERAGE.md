# Test Coverage Overview

> 11 suites · 99 tests · `bun run test`

---

## Setup & Conventions

**Runtime:** Bun — used exclusively as the package manager and script runner (`bun run test`). Under the hood it delegates to Jest via the `test` script in `package.json`.

**Test framework:** Jest (`jest-environment-jsdom` by default), configured in `jest.config.js` using the `next/jest` preset. This preset handles the Next.js-specific transforms (SWC, module aliases, CSS) automatically, so no manual Babel config is needed.

```js
// jest.config.js
import nextJest from 'next/jest.js'
const createJestConfig = nextJest({ dir: './' })
export default createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
})
```

The `@/` alias maps directly to `src/`, so imports like `@/lib/utils/phone-validation` resolve correctly inside tests without any extra config.

**Test environment override:** Files that test Node.js-only code (server actions, API routes, services that use Prisma) declare `@jest-environment node` at the top of the file to opt out of jsdom. This avoids false positives from browser globals leaking into server-side logic.

**File location convention — co-located tests:** Every test file lives next to the file it tests, at the same directory level. No centralised `__tests__` folders.

```
src/
  services/
    barberService.ts
    barberService.test.ts      ← co-located
    authService.ts
    authService.test.ts        ← co-located
  app/
    _actions/
      create-booking.ts
      create-booking.test.ts   ← co-located
    [slug]/
      page.tsx
      page.test.tsx            ← co-located
      _components/
        BookingSheet.tsx
        BookingSheet.cache.test.ts
        BookingSheet.integration.test.tsx
```

The rationale: when you open a source file, the test is immediately visible alongside it. It also makes it obvious when a new file is added without a test.

---

## Utilities

### `phone-validation.test.ts` — 13 tests
Covers `validateInternationalPhone` and `formatPhoneWithCountryCode`.

The validation function is one of the more critical pieces of the booking flow — it's the gatekeeper before any booking hits the database. Tests confirm it accepts valid numbers for all 5 supported countries (PT, BR, GB, DE, FR), rejects empty input, numbers that are too long, wrong formats, and unsupported country codes. There's also a test for input cleaning (e.g. `(11) 98765-4321` → `+5511987654321`), which matters because users paste numbers in all sorts of formats.

`formatPhoneWithCountryCode` is simpler — tests just confirm it concatenates correctly and always produces a `+`-prefixed string.

---

### `time-slot.test.ts` — 6 tests
Covers `generateTimeSlots`.

Straightforward utility that generates time slot strings for the booking calendar. Tests confirm the correct count of slots for a given range, that the default interval is 30 minutes, that different intervals (15min, 60min) work, and that output is always in `HH:MM` format. Edge case: start equals end returns an empty array.

---

## Server Actions

### `get-barber-availability.test.ts` — 6 tests
Covers `calculateAvailableSlots`.

This is the core scheduling logic. The function takes a date, existing bookings, and service duration, and returns which time slots are still free. Tests cover:

- **Empty day** — all 20 slots available (09:00–18:30 in 30-min intervals)
- **Single booking** — the occupied slot is excluded, adjacent slots remain
- **Multiple bookings** — both blocked windows are correctly excluded
- **Business hours boundary** — no slot is offered if it would end after 19:00
- **Chronological order** — slots always come back sorted
- **Multi-slot bookings** — a 90-minute booking correctly blocks 3 consecutive slots

The overlap detection logic (`slotStart < booking.endTime && slotEnd > booking.startTime`) is what makes double-booking impossible, so these tests are important.

---

### `create-booking.test.ts` — 11 tests
Covers `checkTimeSlotAvailability`, `clientHasBookingAtTime`, and `createBooking`. Prisma is fully mocked.

Three distinct concerns tested here:

**`checkTimeSlotAvailability`** — queries by `barberId` for overlapping bookings. Tests confirm 200 when free, 409 when taken, 500 on DB failure, and that the query uses the correct time window (`startTime` to `startTime + duration`).

**`clientHasBookingAtTime`** — same overlap logic but queries by `customerPhone` instead of `barberId`. This prevents the same customer from double-booking themselves. The test explicitly verifies the query uses `customerPhone`, not `barberId` — an easy bug to introduce.

**`createBooking`** — confirms successful creation returns 200, DB failure returns 500, and that `endTime` is correctly calculated as `startTime + duration * 60000`.

---

## API Route

### `route.test.ts` — 4 tests
Covers `GET /api/barber/[slug]`. Prisma is mocked.

Tests the Next.js route handler directly without spinning up a server. Covers the happy path (200 with full shop data including services and barbers), 404 for unknown slugs, 500 on DB failure, and verifies the Prisma query includes the `services` and `barbers` relations — important because missing those would silently break the public page.

---

## Services

### `barberService.test.ts` — 5 tests
Covers `BarberService.getProfileBySlug`. The Axios instance is injected as a dependency so it can be replaced with a mock.

Tests confirm successful fetch returns the full shop data, network errors return `null` gracefully, and — importantly — `favicon.ico` and empty slugs short-circuit before making any HTTP call. That last one prevents a class of spurious API requests that Next.js can trigger during asset resolution.

---

### `authService.test.ts` — 10 tests
Covers `signUp`, `signIn`, `signOut`, `resetPassword`, and `getSession`. Supabase is fully mocked.

Each method is tested for both success and failure paths. A notable case: `signUp` has a third scenario where Supabase returns no error but also no user — the service should still return an error (`"User creation failed"`). This edge case exists because Supabase can return a pending-confirmation state that looks like success.

`resetPassword` also verifies that the redirect URL is passed correctly to Supabase — without it, the password reset email would point nowhere.

---

### `userService.test.ts` — 10 tests
Covers `createUser`, `getUserBySupabaseId`, `getUserByEmail`, `updateUserEmail`, and `deleteUser`. Prisma is mocked.

The most interesting case is `createUser`: it first checks if the user already exists (by `supabaseId`) and returns the existing record without calling `create`. This idempotency is tested explicitly — `mockUser.create` must not be called when the user already exists. This matters because the auth callback can fire multiple times.

All other methods test the standard found/not-found/error triad.

---

## Component Tests

### `BookingSheet.cache.test.ts` — 7 tests
Covers the in-memory availability cache logic extracted from `BookingSheet.tsx`.

The cache uses a 5-minute TTL to avoid hammering the server action on every barber selection. Tests verify that cache keys are deterministic (same inputs → same key), that different barbers or date ranges produce different keys, and that the freshness check correctly distinguishes timestamps within and beyond the 5-minute window — including boundary conditions (just under and just over TTL).

---

### `BookingSheet.integration.test.tsx` — 15 tests
Covers the interaction between the booking form's moving parts: country selector, availability fetch parameters, calendar date filtering, and booking submission.

These tests don't render the component — they validate the logic that connects the pieces:

- Changing country updates dial code, placeholder, and validation rules
- Availability is fetched with a 30-day window from today
- Calendar disables dates not in the available set, and always disables past dates
- Phone validation runs before submission and produces the full international number
- All 5 countries produce correctly formatted numbers that get passed to `createBooking`

The end-to-end test walks through the full flow in sequence to confirm nothing breaks when all parts are combined.

---

### `page.test.tsx` — 8 tests
Covers the `[slug]` SSR page component and `generateMetadata`. `BarberService` and `BookingSheet` are mocked.

Since this is a Server Component, tests render it directly (no DOM) and traverse the React tree to find text. Tests confirm the shop name, services, and barbers appear in the output; that empty states render correctly; and that `notFound()` is called for missing slugs and for `favicon.ico` — the latter without ever calling `getProfileBySlug`.

`generateMetadata` tests cover the title format, description fallback when the shop has no description, and empty metadata for both missing shops and `favicon.ico`.
