# Project Specification: BarberBrand SaaS

## 1. Overview
A multi-tenant SaaS platform enabling barbershops to have fully customizable, high-performance websites.
**Goal:** Deliver a "White Label" experience where each barber shop has its own branding and domain, maximizing SEO scores via Server-Side Rendering (SSR).

## 2. Tech Stack & Requirements Mapping
* **Runtime & Package Manager:** **Bun** (Fast installation and native test runner).
* **Core Framework:** **Next.js 14+** (App Router).
* **Language:** **TypeScript** (Type safety for Prisma and Redux).
* **UI & Styling:**
    * **Tailwind CSS** (Utility-first styling).
    * **Shadcn/ui** (Base components).
    * **Sonner** (Toast notifications for feedback).
* **State Management:** **Redux Toolkit (RTK)**
    * *Purpose:* Global Theme management, real-time preview for the customizer, and persistent tenant configuration.
* **Database & ORM:** **Prisma** + **PostgreSQL**.
* **Authentication:** **Supabase Auth**.
* **HTTP Client:** **Axios** (Service Layer pattern for API/Server Actions).

## 3. Architecture

### 3.1 Database Strategy
* **Local Development:** **PostgreSQL** running in a **Docker Container** or **Supabase CLI** (local emulation).
* **Production:** **Supabase** (Managed PostgreSQL).
* **ORM:** **Prisma** for type-safe queries and migrations.
* **Tenant Isolation:** Application-Level Isolation using `barberShopId` on all related entities (`Service`, `Barber`, `Booking`).

### 3.2 Authentication & Multi-tenancy
* **Provider:** **Supabase Auth**.
* **Identity Logic:** Users (Owners) are linked to a `BarberShop` record.
* **Security:** Session must include `barberShopId` to ensure owners only access their respective dashboard data.

### 3.3 Storage Strategy
* **Service:** **Supabase Storage**.
* **Usage:** Hosting Barber profile pictures and BarberShop logos.
* **Integration:** Next.js Image optimization with Supabase URL loader.

### 3.4 Theming Engine (Redux Powered)
* **Mechanism:** Dynamic CSS Variables (`--primary`, `--secondary`, etc.) injected at the root layout.
* **RTK Slices:** `themeSlice` handles real-time updates for the customizer preview.

## 4. Feature Breakdown (MVP)

### 4.1 Public Barber Page (SSR)
* Dynamic SEO Meta Tags based on Shop configuration.
* Service Listing & Booking Flow using `BookingSheet` (Shadcn Drawer).
* Real-time availability validation via Server Actions.
* International phone support (PT, BR, GB, DE, FR).
* Smart calendar with availability filtering.

### 4.2 Landing & Marketing Pages
* **Homepage:** Hero, features, how it works, pricing CTA.
* **Pricing Page:** Plan comparison, 14-day trial, FAQ.
* **Legal Pages:** Terms of Service, Privacy Policy.

### 4.3 Authentication & Subscription
* **Auth:** Supabase Auth (signup, login, email verification).
* **Subscription:** Stripe integration with 14-day free trial.
* **Plans:** Basic, Pro, Enterprise (pricing TBD).
* **Trial:** Full access for 14 days, credit card required.

### 4.4 Onboarding Wizard
* **Step 1:** Create BarberShop (name, unique slug, description).
* **Step 2:** Add Barbers (1-10, with photos).
* **Step 3:** Add Services (1-20, with pricing).
* **Step 4:** Preview and launch public page.

### 4.5 Admin Dashboard (Protected - CSR)
* **Auth:** Login/Register via Supabase Auth.
* **Management (CRUD):**
  * **Services:** Manage catalog, pricing, and durations (max 20).
  * **Barbers:** Manage staff profiles and photo uploads (max 10).
  * **Bookings:** View and manage appointments calendar.
* **Settings:** Shop details, slug management.
* **Billing:** Subscription management, upgrade/downgrade, cancel.
* **Customization (Optional):** Real-time UI to change colors and logos.

### 4.6 Business Rules & Limits

**Barber Limits:**
* Minimum: 1 barber required
* Maximum: 10 barbers per shop
* Enforced at API level and UI validation

**Service Limits:**
* Minimum: 1 service required
* Maximum: 20 services per shop
* Enforced at API level and UI validation

**Slug Rules:**
* Must be unique across all barbershops
* Format: lowercase, alphanumeric, hyphens only
* Length: 3-50 characters
* Reserved slugs: admin, api, auth, dashboard, pricing, etc.
* Auto-generated from shop name with uniqueness check

**Subscription Rules:**
* 14-day free trial (credit card required)
* Auto-charge after trial unless cancelled
* Grace period: 7 days after payment failure
* Public page remains active during grace period

## 5. Development Workflow (Chunked)

### **Chunk 0: Initialization & Config** (COMPLETED ✅)
* Setup Next.js with Bun.
* Docker setup for local Postgres.
* Axios instance configuration.

### **Chunk 1: Database & API Foundation** (COMPLETED ✅)
* Prisma models: `BarberShop`, `Service`, `Barber`, `Booking`.
* Seed script (`dbdata.ts`) for development testing.

### **Chunk 2: Public Page & Booking Logic** (COMPLETED ✅)
* SSR for `[slug]` pages with dynamic metadata.
* `BookingSheet` component with comprehensive validation.
* International phone validation for 5 countries (PT, BR, GB, DE, FR).
* Smart calendar with barber availability filtering.
* Server Actions for booking persistence with conflict detection.
* Real-time availability calculation with 5-minute cache.
* Prisma seed for sample data.

---

## SaaS Architecture Pivot

**Note:** After completing the public booking page, we've identified the need to implement the complete SaaS flow before continuing with theming. See [SaaS Architecture Document](./saas-architecture.md) for full details.

### **Chunk 3: Landing Page & Marketing** (NEXT)
* **Homepage** (`/`)
  * Hero section with value proposition
  * Features showcase
  * How it works section
  * Social proof (testimonials - future)
  * CTA buttons to pricing
* **Pricing Page** (`/pricing`)
  * Plan comparison table (Basic, Pro, Enterprise)
  * 14-day free trial badge
  * Feature comparison
  * FAQ section
  * CTA: "Start Free Trial"
* **Legal Pages**
  * Terms of Service
  * Privacy Policy
  * Contact page

### **Chunk 4: Authentication & Subscription** (CRITICAL)
* **Supabase Auth Integration**
  * Sign up flow with email verification
  * Login/Logout functionality
  * Password reset
  * Protected route middleware
* **Stripe Integration**
  * Checkout session creation
  * Webhook handling (subscription events)
  * Payment success/failure flows
  * Test mode setup
* **Database Updates**
  * `User` model (linked to Supabase)
  * `Subscription` model (Stripe data)
  * Update `BarberShop` with `userId` relationship
* **Subscription Management**
  * 14-day free trial logic
  * Plan limits enforcement (10 barbers, 20 services)
  * Subscription status checks

### **Chunk 5: Onboarding Wizard** (CRITICAL)
* **Multi-Step Form** (`/onboarding`)
  * Step 1: Create BarberShop (name, slug, description)
    * Real-time slug validation (uniqueness check)
    * Slug auto-generation from name
    * Reserved slug prevention
  * Step 2: Add Barbers (1-10 required)
    * Name, description, photo upload
    * Minimum 1 barber validation
  * Step 3: Add Services (1-20 required)
    * Name, price, duration
    * Minimum 1 service validation
  * Step 4: Preview & Launch
    * Preview public page
    * Confirm and activate
* **State Management**
  * React Context or Redux for wizard state
  * Form validation at each step
  * Progress indicator
* **API Endpoints**
  * `GET /api/onboarding/check-slug` - Slug availability
  * `POST /api/onboarding/complete` - Atomic creation (transaction)

### **Chunk 6: Admin Dashboard** (MANAGEMENT)
* **Dashboard Layout** (`/dashboard`)
  * Protected routes (auth + subscription check)
  * Navigation sidebar
  * User menu with logout
* **Overview Page**
  * Key metrics (bookings, revenue)
  * Recent bookings list
  * Quick actions
* **Barbers Management** (`/dashboard/barbers`)
  * List view with search/filter
  * Create/Edit/Delete barbers
  * Photo upload to Supabase Storage
  * Limit enforcement (max 10)
* **Services Management** (`/dashboard/services`)
  * List view with search/filter
  * Create/Edit/Delete services
  * Limit enforcement (max 20)
* **Bookings View** (`/dashboard/bookings`)
  * Calendar view
  * List view with filters
  * Booking details modal
* **Settings** (`/dashboard/settings`)
  * Shop details (name, description)
  * Slug management (with validation)
  * Danger zone (delete account)
* **Billing** (`/dashboard/billing`)
  * Current plan display
  * Upgrade/Downgrade options
  * Cancel subscription
  * Billing history

### **Chunk 7: Theme Customization** (OPTIONAL)
* **Redux Toolkit Setup**
  * Store configuration
  * `themeSlice` for dynamic colors
  * Persist theme in database
* **Customization UI** (`/dashboard/customize`)
  * Color picker for primary/secondary colors
  * Logo upload
  * Real-time preview
  * Save to database
* **Public Page Theming**
  * Dynamic CSS variables injection
  * Logo display
  * Custom colors applied

### **Chunk 8: Deployment & CI/CD** (PRODUCTION)
* **Environment Setup**
  * Supabase production database
  * Stripe production keys
  * Environment variables management
* **CI/CD Pipeline**
  * GitHub Actions for lint/test/build
  * Automated deployments to Vercel
  * Database migration automation
* **Monitoring**
  * Error tracking (Sentry)
  * Performance monitoring
  * Uptime monitoring
* **Documentation**
  * API documentation
  * User guides
  * Admin documentation