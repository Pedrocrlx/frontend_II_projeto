# Changelog

All notable changes to this project will be documented in this file.

## [Chunk 2] - Dynamic Routing & SSR
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