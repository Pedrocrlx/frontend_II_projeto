# Grid

Grid is a multi-tenant SaaS platform designed for barbershops, enabling them to create professional booking websites with organized scheduling. The platform brings structure and precision to appointment management, featuring smart calendar organization, international booking support, and a clean booking experience for customers.

**Tagline:** Your schedule, organized.

Grid represents the perfect intersection of time slots and appointments - a visual metaphor for organized scheduling. The platform helps barbershops manage bookings with precision, preventing double bookings and providing a seamless experience for both shop owners and their customers.

## Tech Stack

This project leverages a modern, robust, and scalable technology stack:

-   **Core Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Runtime:** [Bun](https://bun.sh/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Database ORM:** [Prisma](https://www.prisma.io/)
-   **Database:** [Supabase](https://supabase.com/) (PostgreSQL) with split environments (dev/prod)
-   **Authentication:** [Supabase Auth](https://supabase.com/auth)
-   **Storage:** [Supabase Storage](https://supabase.com/storage) (profile photos, logos)
-   **Payments:** [Stripe](https://stripe.com/) (subscription management)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
-   **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (theme customization)
-   **API Communication:** [Axios](https://axios-http.com/)
-   **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## Getting Started

Follow these instructions to set up and run the project in a local development environment.

### Prerequisites

-   [Bun](https://bun.sh/docs/installation)
-   [Supabase Account](https://supabase.com/) (for database and authentication)
-   [Stripe Account](https://stripe.com/) (for payment processing)
-   [Docker](https://www.docker.com/products/docker-desktop/) (optional - for local PostgreSQL testing)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend_II_projeto
```

### 2. Install Dependencies

This project uses Bun as its package manager.

```bash
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file by copying the example file and fill in your credentials.

```bash
cp example.env .env
```

**Required Configuration:**

1. **Supabase (Database & Auth)**
   - `DATABASE_URL` - Connection pooling URL (for application queries)
   - `DIRECT_URL` - Direct database URL (for Prisma migrations)
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

2. **Stripe (Payments)**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Publishable key
   - `STRIPE_SECRET_KEY` - Secret key
   - `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

3. **Application**
   - `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., `http://localhost:3000`)

> **Note:** The project uses **Supabase** for both development and production environments. Local Docker PostgreSQL is optional for testing purposes only.

### 4. Set Up Supabase

#### Option A: Use Supabase Cloud (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your connection strings and keys to `.env`
3. Create a storage bucket named `photos` for barber and shop images

#### Option B: Local Development with Docker (Optional)

If you prefer local PostgreSQL for testing:

```bash
docker compose up -d
```

Update `.env` to use the local Docker connection:
```bash
DATABASE_URL="postgresql://admin:password123@localhost:5432/barber_saas?schema=public"
```

### 5. Run Database Migrations

Apply the latest database schema changes using Prisma.

```bash
bunx prisma migrate dev
```

### 6. Seed the Database (Optional)

Populate the database with sample data for development.

```bash
bunx prisma db seed
```

This will create:
- A sample barbershop called "Estilo & Classe Barbearia"
- 3 sample barbers
- 4 sample services
- Initial booking data

For user-specific seeding:
```bash
bun run db:seed:user
```

## Development

### Running the Development Server

To start the Next.js development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Available Scripts

-   `bun run dev`: Starts the development server.
-   `bun run build`: Creates a production-ready build of the application.
-   `bun run start`: Starts the production server (requires `build` to be run first).
-   `bun run lint`: Runs ESLint to check for code quality and style issues.
-   `bun test`: Executes tests using Jest.
-   `bun test:watch`: Runs Jest in interactive watch mode.
-   `bunx prisma db seed`: Seeds the database with sample data.
-   `bunx prisma studio`: Opens Prisma Studio to view and edit database data.
-   `make setup`: Full project setup (installs dependencies, starts DB, runs migrations).
-   `make db-up`: Start local PostgreSQL container (optional).
-   `make db-migrate`: Create a new Prisma migration.
-   `make studio`: Open Prisma Studio.

## Project Structure

The codebase is organized to maintain a clean and scalable architecture:

-   `src/app/`: Contains the core application logic, following the Next.js App Router convention.
    -   `_actions/`: Server Actions for form submissions and mutations.
    -   `api/`: API route handlers.
    -   `[slug]/`: Dynamic pages for each tenant (barbershop).
    -   `dashboard/`: Protected admin dashboard pages.
    -   `onboarding/`: Multi-step onboarding wizard for new shops.
-   `src/components/`: Shared React components, including UI primitives from Shadcn.
    -   `ui/`: Shadcn UI components (auto-generated, don't modify).
    -   `landing/`: Marketing and landing page components.
-   `src/contexts/`: React Context providers (Auth, Theme, i18n).
-   `src/hooks/`: Custom React hooks (auth guards, protected routes).
-   `src/services/`: API service layer (Axios-based) for backend communication.
-   `src/lib/`: Utility functions and library initializations.
    -   `prisma.ts`: Prisma client singleton.
    -   `supabase.ts`: Supabase client for auth and storage.
    -   `stripe.ts`: Stripe client for payment processing.
    -   `i18n/`: Internationalization translations (pt, en, fr, es, de).
-   `prisma/`: Contains the Prisma schema, migrations, and seed scripts.
-   `docs/`: Project documentation, specifications, and chunk completion logs.

## Environments

### Development
- **Database:** Supabase (development project) or local Docker PostgreSQL
- **Auth:** Supabase Auth (development credentials)
- **Storage:** Supabase Storage (photos bucket)
- **Payments:** Stripe (test mode)

### Production
- **Database:** Supabase (production project)
- **Auth:** Supabase Auth (production credentials)
- **Storage:** Supabase Storage (photos bucket)
- **Payments:** Stripe (live mode)
- **Deployment:** Vercel (recommended) with CI/CD via GitHub Actions

> **Important:** Never commit `.env` files. Use environment variables on your hosting platform.

## Key Features

✅ **Multi-tenant SaaS** - Each barbershop gets a unique branded page (`/slug`)  
✅ **Smart Booking System** - Real-time availability with conflict detection  
✅ **International Support** - Phone validation for PT, BR, GB, DE, FR  
✅ **Authentication** - Supabase Auth with email verification and Google OAuth  
✅ **Subscription Management** - Stripe integration with 14-day free trial  
✅ **Onboarding Wizard** - Multi-step setup for new barbershops  
✅ **Admin Dashboard** - Full CRUD for services, barbers, bookings  
✅ **Theme Customization** - Redux-powered color picker with live preview  
✅ **Internationalization** - 5 languages (PT, EN, FR, ES, DE)  
✅ **Dark Mode** - System-aware theme toggle  
✅ **Image Management** - Supabase Storage for logos and profile photos  
✅ **SEO Optimized** - Server-Side Rendering with dynamic metadata  

## Coding Guidelines

We adhere to a strict set of coding guidelines to ensure consistency and maintainability. Key principles include:

-   **KISS (Keep It Simple, Stupid):** Prioritize simple, readable solutions.
-   **Strict Typing:** Use TypeScript effectively and avoid the `any` type.
-   **Service Pattern:** Encapsulate all API communication within the `src/services` directory.
-   **No bare fetch:** Always use the configured Axios instance.
-   **Test Coverage:** All services and critical components must have tests.

For a complete overview, please refer to the [Coding Guidelines](AGENTS.md).