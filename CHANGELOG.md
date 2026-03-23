# Changelog

All notable changes to this project will be documented in this file.

## [Chunk 6] - Admin Dashboard (In Progress)
## [0.7.1] - 23/03/26 ✅
### Added
- **Auth Flow Fix — Onboarding Redirect**
  - `GET /api/user/shop-status` — new endpoint: verifies JWT and checks if user has a `BarberShop` in DB
  - `userService.getShopStatus()` — service method using Axios + Bearer token
  - `auth/callback/route.ts` — after OAuth code exchange, queries DB to determine destination: `/onboarding` (no shop) or `/dashboard` (has shop); cookies forwarded correctly to final response
  - `login/page.tsx` — email/password login now calls `getShopStatus()` before redirecting
  - `proxy.ts` — removed `/onboarding` from `AUTH_ROUTES`; authenticated users can now access `/onboarding` if they have no shop

- **i18n — Internationalisation System**
  - Custom lightweight i18n with zero external dependencies
  - `src/contexts/I18nContext.tsx` — `I18nProvider` + `useI18n()` hook; locale persisted in `localStorage`
  - `src/components/LanguageSelect.tsx` — reusable `<select>` component
  - Translation files: `src/lib/i18n/{pt,en,fr,es,de}.ts`
  - Default language: **Português (PT)**
  - Supported: Português, English, Français, Español, Deutsch
  - `LanguageSelect` added to Navbar (`/`) and Dashboard (`/dashboard`) navbars
  - Covers all UI text: Navbar, Hero, Features, Stats, HowItWorks, Pricing, FinalCTA, Footer, Dashboard cards and loading states
  - `I18nProvider` added to root layout wrapping all pages
  - Navbar DOM-manipulation `useEffect`s removed — auth state now handled reactively via `isAuthenticated`

## [Chunk 5] - Onboarding Wizard
## [0.6.1] - 18/03/26 ✅
### Added
- **Phone Sanitization Utility** (`src/services/onboardingService.ts`)
  - Exported `sanitizePhone()` function: strips spaces, hyphens, parentheses, and other non-digit characters
  - Preserves `+` country prefix when present (e.g. `"+351 912 345 678"` → `"+351912345678"`)
  - Applied to barber phones and shop phone before `POST /api/onboarding/complete`

- **Slug Real-Time Availability Check** (`src/app/onboarding/page.tsx`)
  - Debounced 500ms call to `onboardingService.checkSlug()` on every slug change
  - Status states: `idle | checking | available | taken | invalid`
  - Visual feedback on slug input field: spinner (checking), green check + border (available), red X + border (taken/invalid)
  - Inline message below field: "Available!", "This URL is already taken.", "Only lowercase letters, numbers, and hyphens allowed."
  - "Continue" button blocked until `slugStatus === "available"`

- **Limit Counters & Warnings** (`src/app/onboarding/page.tsx`)
  - Step 2 (Barbers): live badge `X/10` in header, turns amber at limit; subtitle updates to "Maximum reached."
  - Step 3 (Services): live badge `X/20` in header, turns amber at limit; subtitle updates to "Maximum reached."
  - "Add another barber/service" button replaced by amber warning message when limit is reached

## [0.6.0] - 17/03/26 ✅
### Added
- **Onboarding Wizard** (`/onboarding`)
  - 4-step multi-step form with animated stepper progress indicator
  - Step 1 — Shop: name, slug (auto-generated from name with accent removal), description, phone, address; reserved slug prevention
  - Step 2 — Team: up to 10 barbers with name, specialty, phone (required), instagram (optional), photo upload UI
  - Step 3 — Services: up to 20 services with name, price, duration selector (15min–2h)
  - Step 4 — Launch: review summary (shop name, URL, team size, service count) + launch button
  - Per-step validation gates (Continue disabled until step is valid)
  - Auth guard: redirects unauthenticated users to `/auth/login`
  - Toast feedback on success and error

- **API Endpoints**
  - `GET /api/onboarding/check-slug` — validates slug format, reserved list, and DB uniqueness
  - `POST /api/onboarding/complete` — atomic Prisma transaction (BarberShop + Barbers + Services); JWT auth via Bearer token; auto-creates User record on first login

- **Service Layer** (`src/services/onboardingService.ts`)
  - `OnboardingServiceClient.complete()` — attaches Supabase session JWT, posts payload
  - `OnboardingServiceClient.checkSlug()` — slug availability check

- **Schema Updates**
  - `BarberShop`: added `phone`, `address` fields
  - `Barber`: added `phone` (required), `instagram` (optional) fields
  - Migration: `20260317214640_add_contact_social_fields`
  
### Added
- **Dark Theme Implementation** 
  - Installed `next-themes@0.46` for theme management
  - Created `src/contexts/ThemeProvider.tsx` - Next-themes provider wrapper with class-based strategy
  - Created `src/components/ThemeToggle.tsx` - Theme toggle button with Sun/Moon icons
  - Applied comprehensive dark mode (`dark:` classes) to all pages:
    - Landing page (Hero, Features, Stats, HowItWorks, Pricing, FinalCTA, Footer, Navbar)
    - Auth pages (login, signup, forgot-password, verify-email)
    - Dashboard placeholder
  - Added theme toggle button to navigation bars (landing and dashboard)
  - Configured Tailwind with custom dark variant: `@custom-variant dark (&:is(.dark *))`

- **Dark Theme CSS Updates** (`src/app/globals.css`)
  - Added CSS rules for theme styling using `html.dark body` selector
  - Added `color-scheme` property for browser-level theme support
  - Prevents hydration mismatch by moving styles from Tailwind classes to CSS

- **Hydration Error Fixes**
  - Added `suppressHydrationWarning` to `<html>` element in root layout
  - Removed dark mode Tailwind classes from body element
  - Set `disableTransitionOnChange` in ThemeProvider to prevent visual glitches
  - Removed dynamic date computation from Footer component
  - Added `"use client"` directives to all landing components
  - Fixed ThemeToggle component rendering to avoid early returns

- **Icon Fixes**
  - Updated ThemeToggle SVG icons to use `stroke` instead of problematic `fill` paths
  - Implemented proper Sun icon (center circle + 8 rays) with `strokeWidth="2"`
  - Implemented proper Moon icon (crescent) with `strokeWidth="2"`
  - Both icons now properly respect `currentColor` for theme-aware styling

### Updated Components
- **Landing Components:** Features, HowItWorks, Pricing now have complete dark mode support
- **Navbar:** Updated spacing (`space-x-8` → `space-x-6`) to accommodate theme toggle
- **Theme Provider:** Enhanced configuration with proper mounting detection

### Technical Details
- Theme storage: localStorage with `storageKey="theme"`
- Default theme: "light"
- Attribute strategy: class-based (`className="dark"` on html element)
- Build validation: All builds pass without errors

### Notes
- Hydration errors resolved by separating server-side rendering from client-side theme application
- Theme persistence works correctly across page reloads
- All UI components properly styled in both light and dark modes
- Theme toggle button fully functional in all navigations

## [Chunk 4] - Authentication & Subscription
## [0.5.0] - 11/03/26 ✅
### Added
- **Supabase Auth Integration**
  - Sign up page (`/auth/signup`) with name, email, password confirmation, and terms acceptance
  - Login page (`/auth/login`) with email/password and forgot password link
  - Forgot password page (`/auth/forgot-password`) with email input and success confirmation
  - Email verification page (`/auth/verify-email`) with redirect instructions
  - Toast notifications for all auth feedback (Sonner)

- **Route Protection Middleware** (`src/middleware.ts`)
  - Server-side protection using `@supabase/ssr` for cookie-based sessions
  - Unauthenticated users redirected to `/auth/login` with `?redirectTo` param
  - Authenticated users redirected away from auth pages to `/dashboard`
  - Covers `/dashboard/*` and `/onboarding/*` routes

- **Auth Infrastructure**
  - `src/lib/supabase.ts` - Supabase client initialization with env validation
  - `src/lib/stripe.ts` - Stripe client initialized (implementation deferred)
  - `src/contexts/AuthContext.tsx` - Global auth state with `useAuth()` hook
  - `src/services/authService.ts` - Service pattern: signUp, signIn, signOut, resetPassword, updatePassword, getSession, getCurrentUser
  - `src/services/userService.ts` - Service pattern: createUser, getUserBySupabaseId, getUserByEmail, updateUserEmail, deleteUser
  - `src/hooks/useProtectedRoute.ts` - `useProtectedRoute()` and `usePublicRoute()` hooks
  - `src/types/auth.ts` - TypeScript interfaces: AuthUser, SignUpData, SignInData, AuthContextType

- **Database Updates**
  - `User` model with `supabaseId` link to Supabase Auth
  - `Subscription` model with full Stripe fields (plan, status, trial, billing periods)
  - `BarberShop` updated with `userId` foreign key (owner association)
  - Migration `20260305210942_add_auth_models` applied

- **Dashboard Placeholder** (`/dashboard`)
  - Auth-protected page with user greeting
  - Sections for Barbers, Services, Bookings, Settings, Billing (all marked Coming Soon)
  - Sign out button connected to `authService`

- **Prisma Seed Updates**
  - `prisma/seed.ts` updated: creates User → BarberShop (PedroBarberShop) → 2 Barbers (Patrick, Zé) → 3 Services (Corte, Barba, Corte + Barba)
  - `prisma/seed-user.ts` added: creates test user in both Supabase Auth and Prisma DB

- **Prisma 5 Maintained**
  - Upgraded to Prisma 7 and rolled back due to breaking changes in env loading
  - Prisma 5.10.2 retained as stable baseline
  - `@supabase/ssr` used for server-side session management in middleware

### Notes
- Stripe integration installed but deferred (no checkout/webhook yet - Chunk 5 prerequisite)
- Auth system fully functional: signup → email verification → login → dashboard redirect
- Middleware uses Supabase SSR for secure server-side session validation
- Service pattern enforced throughout (no direct Supabase calls in components)

---

## [Chunk 3] - Landing Page & Marketing
## [0.4.0] - 05/03/26 ✅
### Added
- **Landing Page Homepage** (`/`)
  - Complete page structure with Hero, Features, Stats, How it Works, Pricing, and Footer sections
  - Fully responsive design with Tailwind CSS and Shadcn components
  - Professional visual identity with Grid branding
  
- **Landing Page Components** (`src/components/landing/`)
  - **Navbar:** Fixed header with logo, navigation anchors (Features, How it Works, Pricing), Login and "Start Free Trial" CTAs
  - **Hero Section:** Main headline "Your Barbershop Schedule, Perfectly Organized" with dual CTAs and "No credit card required" badge
  - **Stats Section:** Key metrics highlighting platform capabilities
  - **Features Section:** Three core features (Smart Grid Calendar, International Ready, Instant Setup)
  - **How it Works:** 3-step process visualization (Setup, Configure, Launch)
  - **Pricing Section:** Three pricing tiers (Basic, Pro, Enterprise) with feature comparison and trial badges
  - **Final CTA:** Strong call-to-action section encouraging trial signup
  - **Footer:** Organized sections for Product, Company, and Legal with proper routing

- **Legal Pages** (Complete Implementation ✅)
  - **Terms of Service** (`/terms`)
    - 18 comprehensive sections covering user rights, restrictions, and obligations
    - Payment and billing terms with trial period details (14-day free trial)
    - Subscription, cancellation, and termination policies
    - Limitation of liability and indemnification clauses
    - Governing law (Portugal) and contact information
    - Professional legal formatting with section navigation
  
  - **Privacy Policy** (`/privacy`)
    - Complete data privacy compliance with GDPR standards
    - 14 sections covering data collection, processing, and user rights
    - Information on cookies, tracking technologies, and data retention
    - Rights and choices for EU users (GDPR compliance)
    - Third-party service disclosure (Stripe, Supabase, email providers)
    - Data security measures and breach notification procedures
    - Clear contact information for privacy inquiries
  
  - **Contact Page** (`/contact`)
    - Interactive contact form with multiple subject categories
    - Form validation for email, name, subject, and message
    - Toast notifications for form feedback
    - Contact information sections (Email, Sales inquiries)
    - Social media links (Twitter, LinkedIn, Instagram)
    - Help categories explanation (Getting Started, Technical Support, Billing)
    - FAQ quick link for self-service support

- **Visual Design & UX**
  - Grid background pattern with smooth animations
  - Professional color scheme (slate 900, blue 600 accents)
  - Fully responsive layout (mobile-first approach)
  - Hover states and smooth transitions for interactive elements
  - Shadow effects and rounded corners for modern aesthetic
  - Hero section with gradient overlay and floating mockup preview

### Updated Components
- **Footer:** Updated legal links to route to `/terms`, `/privacy`, and `/contact` instead of `#` placeholders
- **Navigation:** Consistent routing and link structure across all legal pages

### Documentation
- All pages include SEO metadata (title and description)
- Back navigation links between legal pages for easy user navigation
- Professional legal language following market standards for SaaS platforms
- GDPR compliance and data protection best practices implemented

### Notes
- Chunk 3 is now 100% complete with all marketing and legal pages implemented
- All pages follow Grid's professional branding and design system
- Legal content adapted to Grid's specific business model (barbershop bookings, 14-day trial, subscription)
- Contact form includes client-side validation with toast notifications
- Ready for production launch with full legal coverage

---

## Architecture Pivot - SaaS Flow Implementation

After completing the public booking page, we've identified the need to implement the complete SaaS flow (landing page, auth, subscription, onboarding) before continuing with additional features.

### Added
- **SaaS Architecture Document** (`docs/saas-architecture.md`)
  - Complete user journey mapping
  - Subscription plans structure (14-day trial)
  - Stripe integration architecture
  - Onboarding wizard specification
  - Business rules and limits (10 barbers, 20 services)
  - Database schema updates (User, Subscription models)
  - Security and compliance considerations
  
- **Updated Project Specification** (`docs/spec.md`)
  - Reorganized chunks to prioritize SaaS flow
  - Chunk 3: Landing Page & Marketing
  - Chunk 4: Authentication & Subscription (Supabase + Stripe)
  - Chunk 5: Onboarding Wizard
  - Chunk 6: Admin Dashboard
  - Chunk 7: Theme Customization (optional)
  - Chunk 8: Deployment & CI/CD
  
- **Quick Reference Guide** (`docs/QUICK_REFERENCE.md`)
  - Architecture overview diagram
  - Route structure
  - Database models and relationships
  - Development commands
  - Business rules summary
  - Common issues and solutions

### Next Steps
- Chunk 4: Supabase Auth + Stripe integration
- Chunk 5: Multi-step onboarding wizard

---

## [Chunk 2] - Public Page & Booking Logic
## [0.3.0] - 27/02/26 ✅
### Added
- **International Booking Support**
  - Phone validation for 5 countries (PT, BR, GB, DE, FR)
  - Country selector with dial code prefix display
  - Country-specific validation patterns and formatting
  - Database schema update: `customerCountry` field in Booking model
  
- **Smart Calendar with Availability Filtering**
  - Server action to fetch barber availability by date range
  - Calculate available time slots (30-min intervals, 9-19h business hours)
  - Disable unavailable dates in calendar UI
  - 5-minute cache for availability data (performance optimization)
  
- **Enhanced Booking Flow**
  - Real-time availability validation via Server Actions
  - Conflict detection (time slot and client double-booking)
  - Comprehensive form validation with user-friendly error messages
  - Toast notifications for booking feedback
  
- **Prisma Seed**
  - Created `prisma/seed.ts` for "Estilo & Classe Barbearia"
  - Sample data: 3 barbers and 4 services
  - Documentation for seed usage
  
- **Test Coverage**
  - 42 tests passing (phone validation, availability, integration, cache)
  - Unit tests for phone validation (14 tests)
  - Availability calculation tests (6 tests)
  - Integration tests (15 tests)
  - Cache logic tests (7 tests)

### Documentation
- Updated README.md with seed instructions
- Created prisma/README.md with database management guide

---
## [0.2.0] - 19/02/26 ✅
### Added
- Implemented dynamic routing for barber shop pages (`src/app/[slug]/page.tsx`).
- Corrected type definitions for page properties in `src/app/[slug]/page.tsx`.
- Added `generateMetadata` function for dynamic SEO titles on barber shop pages.
- Enhanced unit test coverage for `BarberPage` component, including metadata generation.

## [Chunk 1] - Database & API Foundation
## [0.1.0] - 13/06/26 ✅
### Added
- Initial project structure using Next.js 16 and Bun.
- Docker Compose configuration for PostgreSQL and Adminer.
- Prisma ORM setup connected to PostgreSQL.
- Database schema for `BarberShop` and `Service`.
- API Endpoint `GET /api/barber/[slug]` to fetch barber shop details via Prisma.
- `Makefile` to automate database migrations and development commands.
- `CODING_GUIDELINE.md` to standardize development practices.

## [Chunk 0] - Initialization
## [0.0.0] - 12/02/26 ✅
### Added 
- Project initialized with Next.js, TypeScript, and Bun.
- Docker Compose setup for PostgreSQL and Adminer.
- Prisma ORM installed and initialized.
- Axios and Jest installed.
- Documentation files (spec, guidelines) created.