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
-   **Database:** [PostgreSQL](https://www.postgresql.org/) (managed via Docker for local development)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
-   **API Communication:** [Axios](https://axios-http.com/)
-   **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

## Getting Started

Follow these instructions to set up and run the project in a local development environment.

### Prerequisites

-   [Bun](https://bun.sh/docs/installation)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

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

Create a `.env` file by copying the example file. This will contain the database connection string.

```bash
cp example.env .env
```

The default `DATABASE_URL` is configured for the local Docker environment.

### 4. Start the Database

Run the PostgreSQL database service using Docker Compose.

```bash
docker compose up -d
```
The `-d` flag runs the container in detached mode.

### 5. Run Database Migrations

Apply the latest database schema changes using Prisma.

```bash
bunx prisma migrate dev
```

### 6. Seed the Database (Optional)

Populate the database with initial data for development.

```bash
bunx prisma db seed
```

This will create a sample barbershop called "Estilo & Classe Barbearia" with 3 barbers and 4 services.

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

## Project Structure

The codebase is organized to maintain a clean and scalable architecture:

-   `src/app/`: Contains the core application logic, following the Next.js App Router convention.
    -   `api/`: API route handlers.
    -   `[slug]/`: Dynamic pages for each tenant (barbershop).
-   `src/components/`: Shared React components, including UI primitives from Shadcn.
-   `src/services/`: Houses API service modules (e.g., Axios wrappers) for interacting with the backend.
-   `src/lib/`: Utility functions and library initializations (e.g., `prisma.ts`).
-   `prisma/`: Contains the Prisma schema (`schema.prisma`), migrations, and seed scripts.
-   `docs/`: Project documentation, including coding guidelines and specifications.

## Coding Guidelines

We adhere to a strict set of coding guidelines to ensure consistency and maintainability. Key principles include:

-   **KISS (Keep It Simple, Stupid):** Prioritize simple, readable solutions.
-   **Strict Typing:** Use TypeScript effectively and avoid the `any` type.
-   **Service Pattern:** Encapsulate all API communication within the `src/services` directory.

For a complete overview, please refer to the [Coding Guidelines](docs/CODING_GUIDELINE.md).