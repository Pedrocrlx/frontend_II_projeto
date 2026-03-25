# Test Coverage Overview

> **13 suites · 99 tests** · `bun run test`

**Last Updated:** 2026-03-25 — Added 46 new tests, 2 new test files, fixed critical bugs

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

### `get-barber-availability.test.ts` — 12 tests
Covers `calculateAvailableSlots` (utility function) and `getBarberAvailableDates` (main server action). Prisma is fully mocked.

**`calculateAvailableSlots` (6 tests)** — This is the core scheduling logic. The function takes a date, existing bookings, and service duration, and returns which time slots are still free. Tests cover:

- **Empty day** — all 20 slots available (09:00–18:30 in 30-min intervals)
- **Single booking** — the occupied slot is excluded, adjacent slots remain
- **Multiple bookings** — both blocked windows are correctly excluded
- **Business hours boundary** — no slot is offered if it would end after 19:00
- **Chronological order** — slots always come back sorted
- **Multi-slot bookings** — a 90-minute booking correctly blocks 3 consecutive slots

The overlap detection logic (`slotStart < booking.endTime && slotEnd > booking.startTime`) is what makes double-booking impossible, so these tests are important.

**`getBarberAvailableDates` (6 tests)** — Tests the main server action that orchestrates Prisma queries and date iteration:

- **All dates available** — when no bookings exist, all dates in range have full availability
- **Exclude fully booked dates** — dates with no available slots are filtered out
- **Partial availability** — dates with some slots free are included with accurate slot count
- **Multi-day bookings** — bookings spanning multiple dates affect all relevant days
- **Date objects** — confirms return type is proper Date objects, not strings
- **ISO date keys** — verifies internal date mapping uses ISO format for consistency

---

### `create-booking.test.ts` — 11 tests
Covers `checkTimeSlotAvailability`, `clientHasBookingAtTime`, and `createBooking`. Prisma is fully mocked.

Three distinct concerns tested here:

**`checkTimeSlotAvailability`** — queries by `barberId` for overlapping bookings. Tests confirm 200 when free, 409 when taken, 500 on DB failure, and that the query uses the correct time window (`startTime` to `startTime + duration`).

**`clientHasBookingAtTime`** — same overlap logic but queries by `customerPhone` instead of `barberId`. This prevents the same customer from double-booking themselves. The test explicitly verifies the query uses `customerPhone`, not `barberId` — an easy bug to introduce.

**`createBooking`** — confirms successful creation returns 200, DB failure returns 500, that `endTime` is correctly calculated as `startTime + duration * 60000`, and that `revalidatePath` is called to invalidate the cache for the barbershop page.

---

### `dashboard-barbers.test.ts` — 26 tests
Covers `getShopByUserId`, `createBarber`, `updateBarber`, and `deleteBarber`. Prisma and `StorageService` are mocked.

**Critical business rules enforced:**
- **Maximum 10 barbers** — attempts to create beyond the limit return 400 error
- **Minimum 1 barber** — deletion of the last barber is blocked with 409 error (SOURCE CODE FIXED)

**Image deletion side effects (NEW):**
- `updateBarber` deletes old image from storage when image URL changes
- `deleteBarber` removes image from storage before deleting the record
- No deletion occurs when barber has no image
- No deletion when image URL remains unchanged

**Other test coverage:**
- **Successful CRUD operations** — happy paths return 200 with data serialization (Decimal → string)
- **Error handling** — barber not found returns 404, database failures return 500
- **Validation** — empty name/invalid data returns 400
- **Side effects verification** — `revalidatePath` called on mutations, errors logged to console
- **Edge cases** — updating non-existent barber, deleting already-deleted barber

The image deletion tests were added after discovering that this critical cleanup logic was completely untested, risking storage leaks in production.

---

### `dashboard-services.test.ts` — 11 tests
Covers `getShopByUserId`, `createService`, `updateService`, and `deleteService`. Prisma is mocked.

**Critical business rules enforced:**
- **Maximum 20 services** — attempts to create beyond the limit return 400 error
- **Minimum 1 service** — deletion of the last service is blocked with 409 error (SOURCE CODE FIXED)

**Decimal serialization (NEW):**
- `getShopByUserId` converts service prices from Prisma Decimal to string
- `createService` returns price as string in response
- `updateService` returns price as string in response

Prisma's `Decimal` type cannot be serialized to JSON directly — Next.js server actions must convert to string. These tests ensure the conversion happens at all three endpoints.

**Other test coverage:**
- **Successful CRUD operations** — create/update/delete return 200 with proper data structure
- **Error handling** — service not found returns 404, database failures return 500
- **Validation** — negative duration/price returns 400, missing required fields returns error
- **Side effects** — `revalidatePath` called on mutations, errors logged to console

---

## API Routes

### `GET /api/barber/[slug]` — `route.test.ts` — 4 tests
Tests the public barbershop profile endpoint. Prisma is mocked.

Tests the Next.js route handler directly without spinning up a server. Covers the happy path (200 with full shop data including services and barbers), 404 for unknown slugs, 500 on DB failure, and verifies the Prisma query includes the `services` and `barbers` relations — important because missing those would silently break the public page.

---

### `GET /api/onboarding/check-slug` — `route.test.ts` — 10 tests (NEW)
Tests the slug availability checker used during barbershop registration. Prisma is mocked.

**Business rules enforced:**
- **Slug uniqueness** — returns `available: false` when slug already exists in database
- **Reserved slugs** — blocks registration of protected routes (`api`, `dashboard`, `auth`, `admin`, etc.)
- **Slug validation** — enforces 3-30 character length, lowercase alphanumeric + hyphens only

**Test coverage:**
- Available slug returns `{ available: true }`
- Existing slug returns `{ available: false }`
- Reserved slug (e.g., `api`, `admin`) returns `{ available: false, message: "..." }`
- Too short (< 3 chars) returns 400 with validation error
- Too long (> 30 chars) returns 400 with validation error
- Invalid characters (uppercase, special chars) return 400
- Lowercase normalization — uppercase input is converted to lowercase before validation
- Whitespace trimming — leading/trailing spaces are removed
- Valid slug with hyphens and numbers passes validation
- Missing slug parameter returns 400

This endpoint is critical for preventing namespace collisions and ensuring SEO-friendly URLs.

---

### `POST /api/onboarding/complete` — `route.test.ts` — 14 tests (NEW)
Tests the onboarding completion flow that creates barbershops. Prisma and Supabase are mocked.

**Business rules enforced:**
- **Atomic transaction** — barber shop, default barber, and default service are created in a single transaction
- **Slug uniqueness** — returns 409 if slug is taken between validation and creation
- **Input validation** — shop name must be 3+ chars, slug must follow format rules
- **Required data** — at least one barber and one service must be provided

**Authentication & authorization:**
- Missing `Authorization` header returns 401
- Invalid authorization format returns 401
- Invalid Supabase token returns 401
- Successfully extracts `userId` from JWT and uses it as `ownerId`

**Test coverage:**
- No auth header → 401 Unauthorized
- Invalid auth format (missing "Bearer") → 401
- Invalid Supabase token → 401
- Shop name too short (< 3 chars) → 400 Bad Request
- Invalid slug format → 400
- Reserved slug (`dashboard`) → 400
- No barbers provided → 400 with message "At least one barber is required"
- No services provided → 400 with message "At least one service is required"
- Slug already taken → 409 Conflict
- **First-time user creation** — creates User record if doesn't exist, then creates shop
- **Existing user onboarding** — finds existing User record, creates shop under their account
- **Atomic transaction verification** — confirms `prisma.$transaction` is called with all creates
- Internal server error → 500 with generic error message
- Error logging verification — `console.error` called on failures

This is the most complex API route in the application — it coordinates authentication, user management, slug validation, and atomic database writes across multiple tables.

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

### `BookingSheet.logic.test.tsx` — 15 tests (RENAMED from integration)
Covers the interaction between the booking form's moving parts: country selector, availability fetch parameters, calendar date filtering, and booking submission.

**Note:** This file was renamed from `BookingSheet.integration.test.tsx` because it doesn't actually render the component or test React integration — it validates pure business logic.

These tests validate the logic that connects the booking form pieces:

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

---

## Test Improvements Summary (2026-03-25)

This test suite overhaul added **46 new tests** across **7 files** (2 new, 5 enhanced), increasing total coverage from 53 to 99 tests.

### Critical Bugs Fixed in Source Code
1. **`dashboard-barbers.ts`** — Added minimum barber validation in `deleteBarber()` to prevent deleting the last barber (business rule enforcement)
2. **`dashboard-services.ts`** — Added minimum service validation in `deleteService()` to prevent deleting the last service (business rule enforcement)

### New Test Files Created
- **`src/app/api/onboarding/check-slug/route.test.ts`** (10 tests) — Slug validation, uniqueness checks, reserved slug blocking
- **`src/app/api/onboarding/complete/route.test.ts`** (14 tests) — Onboarding flow, authentication, atomic transactions, user creation

### Enhanced Test Files
- **`dashboard-barbers.test.ts`** (+9 tests) — Image deletion side effects, minimum barber validation, error logging verification
- **`dashboard-services.test.ts`** (+7 tests) — Prisma Decimal serialization, minimum service validation, cache invalidation
- **`get-barber-availability.test.ts`** (+6 tests) — Main function `getBarberAvailableDates()` coverage, date filtering logic
- **`create-booking.test.ts`** (+1 enhancement) — Added `revalidatePath` verification
- **`BookingSheet.integration.test.tsx`** → **`BookingSheet.logic.test.tsx`** (renamed) — File renamed to accurately reflect that it tests logic, not React integration

### Key Testing Patterns Established
- **Side effect verification** — All tests now verify `console.error` logging, `revalidatePath` cache invalidation, and external service calls (image deletion)
- **Business rule enforcement** — Min/max limits (1-10 barbers, 1-20 services) tested at boundaries
- **Data serialization** — Prisma Decimal → string conversion tested for all service price endpoints
- **Authentication flows** — JWT extraction, token validation, user creation idempotency
- **Atomic operations** — Transaction verification for multi-table writes

### Coverage Gaps Closed
| Gap | Solution |
|-----|----------|
| Image deletion untested → storage leaks | Added 4 tests for `StorageService.deleteImage` calls |
| Onboarding API had zero tests | Created 24 tests for slug validation + completion flow |
| Main availability function untested | Added 6 tests for `getBarberAvailableDates()` |
| Minimum barber/service rules not enforced | Fixed source code + added validation tests |
| Decimal serialization untested | Added 3 tests verifying Prisma Decimal → string conversion |
| Cache invalidation not verified | Enhanced all mutation tests with `revalidatePath` assertions |

### Test File Naming Convention
- **`.test.ts`** — Unit tests for utilities, services, server actions
- **`.test.tsx`** — Component tests (Server Components or logic extraction)
- **Descriptive suffixes** — `.cache.test.ts`, `.logic.test.tsx` indicate specialized test focus

All tests follow the **Arrange-Act-Assert** pattern and mock external dependencies (Prisma, Supabase, Axios, Storage) to ensure fast, isolated, deterministic execution.
