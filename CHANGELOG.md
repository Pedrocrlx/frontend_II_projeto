# Changelog

All notable changes to this project will be documented in this file.

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
- Chunk 3: Landing page with hero, features, pricing
- Chunk 4: Supabase Auth + Stripe integration
- Chunk 5: Multi-step onboarding wizard

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