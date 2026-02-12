# Project Specification: BarberBrand SaaS

## 1. Overview
A multi-tenant SaaS platform enabling barbershops/salons to have fully customizable, high-performance websites.
**Goal:** Deliver a "White Label" experience where each barber has their own branding and domain, while maximizing SEO scores via Server-Side Rendering (SSR).

## 2. Tech Stack & Requirements Mapping
* **Runtime & Package Manager:** **Bun**
    * *Why:* Faster package installation, startup times, and built-in test runner compatibility.
* **Core Framework:** **Next.js** (App Router)
    * *Satisfies:* SSR, API Routes, Navigation, SEO capabilities.
* **Language:** **TypeScript**
    * *Satisfies:* Type safety, scalability, and better developer experience with Prisma.
* **HTTP Client:** **Axios**
    * *Satisfies:* Standardized API calls, interceptors for auth tokens, consistent error handling.
* **Testing:** **Jest** + **React Testing Library**
    * *Satisfies:* Unit Testing requirement. (Using `bun-jest` or native Bun test runner where applicable).
* **Styling:** **Tailwind CSS**
    * *Satisfies:* Responsive design, utility-first styling for dynamic theming variables.
* **Authentication:** **NextAuth.js** (or similar Auth provider).
* **State Management:** **React Context API** (Global Theme) & **React Query** (Server State).

## 3. Architecture

### 3.1 Database Strategy
* **Database Engine:** **PostgreSQL**
    * **Development Environment:** Runs inside a local **Docker Container** (via `docker-compose.yml`). This ensures a clean, isolated environment that mimics production.
    * **Production Environment:** Managed PostgreSQL Service (e.g., **Supabase** or AWS RDS).
* **ORM & Data Access:** **Prisma**
    * **Role:** Acts as the bridge between Next.js (TypeScript) and PostgreSQL.
    * **Responsibilities:** * Schema Definition (`schema.prisma`).
        * Database Migrations (Version control for DB structure).
        * Type-safe Querying (CRUD operations).
* **Tenant Isolation:** Application-Level Isolation.
    * Every table (e.g., `Service`, `Booking`, `Customer`) includes a `tenantId` (or `barberShopId`) foreign key.
    * API routes must always filter queries by this ID.

### 3.2 DevOps & Infrastructure (Future Roadmap)
* **Containerization:** **Docker** (Multi-stage builds for optimized Next.js images).
* **Orchestration:** **Kubernetes (K8s)** via Minikube (Local) or Cloud Provider.
* **IaC:** **Terraform** for resource provisioning.
* **CI/CD:** **GitHub Actions** pipelines (Lint -> Test -> Build -> Deploy).

## 4. Feature Breakdown (MVP)
1.  **Public Barber Page (Frontend - SSR):**
    * Dynamic Theme Injection (CSS Variables for Logo, Colors).
    * Services List & Pricing (Fetched via Prisma/API).
    * SEO Meta Tags injection based on Tenant config.
2.  **Admin Dashboard (Protected - CSR):**
    * Authentication.
    * CRUD Operations for Services and Shop Profile.
    * Real-time Theme Customizer.

## 5. Development Workflow (Chunked)
We strictly follow a chunked development process. A chunk is closed only when requirements + **passing tests** + changelog are met.

### Planned Chunks:
* **Chunk 0: Initialization & Config**
    * Setup Next.js with **Bun**.
    * Configure **Jest** environment.
    * Setup **Axios** instance.
    * **Docker Setup:** Create `docker-compose.yml` to spin up local PostgreSQL.
    * **Goal:** `bun dev` runs the app and `docker compose up` starts the database.
* **Chunk 1: Database & API Foundation**
    * Setup **Prisma**: Connect to local Docker Postgres.
    * Define Schema: `BarberShop`, `Service` models.
    * Run Migrations: `bunx prisma migrate dev`.
    * Create API endpoints with Axios services.
    * **Test:** Unit tests for API responses using Jest Mocks.
* **Chunk 2: Dynamic Routing & SSR**
    * Implement `[slug]` pages.
    * **Test:** Verify correct JSON data injection based on URL.
* **Chunk 3: Theming Engine**
    * Implement ThemeContext.
    * **Test:** Verify CSS variables update on state change.
* **Chunk 4: Authentication & Dashboard**
    * Protect routes.
    * **Test:** Verify redirection for unauthenticated users.
* **Chunk 5: DevOps & Containerization (Phase 2)**
    * Create `Dockerfile` for the app.
    * Setup GitHub Actions.