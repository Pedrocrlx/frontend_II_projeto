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

### 4.2 Admin Dashboard (Protected - CSR)
* **Auth:** Login/Register via Supabase Auth.
* **Management (CRUD):**
    * **Services:** Manage catalog, pricing, and durations.
    * **Barbers:** Manage staff profiles and photo uploads.
    * **Bookings:** View and manage appointments calendar.
* **Customizer:** Real-time UI to change colors, logos, and shop details, persisted in the DB.

## 5. Development Workflow (Chunked)

### **Chunk 0: Initialization & Config** (COMPLETED)
* Setup Next.js with Bun.
* Docker setup for local Postgres.
* Axios instance configuration.

### **Chunk 1: Database & API Foundation** (COMPLETED)
* Prisma models: `BarberShop`, `Service`, `Barber`, `Booking`.
* Seed script (`dbdata.ts`) for development testing.

### **Chunk 2: Public Page & Booking Logic** (IN PROGRESS)
* SSR for `[slug]` pages.
* `BookingSheet` component with validation (TimeSlot & Phone Regex).
* Server Actions for booking persistence.

### **Chunk 3: Redux & Global Theming** (NEXT)
* Setup **Redux Toolkit** store and providers.
* Implement `themeSlice` for dynamic color injection.
* Migrate existing theme logic to Redux.

### **Chunk 4: Supabase Auth & Admin Dashboard**
* Setup **Supabase CLI** for local Auth/Storage development.
* Implement login/protected routes.
* Build the Admin Dashboard CRUDs (Barbers/Services).
* Implement image upload to Supabase Storage.

### **Chunk 5: Deployment & CI/CD**
* Supabase Production DB connection.
* GitHub Actions for Lint/Test/Build.
* Vercel/Docker Deployment.