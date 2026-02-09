# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It utilizes React for UI development, TypeScript for type safety, and Tailwind CSS for styling. The project is configured to use `next/font` for optimized font loading, specifically the Geist font family. The folder structure follows the Next.js App Router conventions.

# Building and Running

The project can be built and run using `bun`, `npm`, `yarn`, or `pnpm`.

## Development

To run the development server:

```bash
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result. Pages auto-update on edit.

## Build

To build the project for production:

```bash
bun build
# or
npm run build
# or
yarn build
# or
pnpm build
```

## Start

To start the production server after building:

```bash
bun start
# or
npm run start
# or
yarn start
# or
pnpm start
```

## Linting

To run ESLint for code quality checks:

```bash
bun lint
# or
npm run lint
# or
yarn lint
# or
pnpm lint
```

# Development Conventions

*   **Linting:** ESLint is configured for code quality and style checking, as defined in `eslint.config.mjs`.
*   **Type Checking:** TypeScript is used throughout the project for static type checking, configured via `tsconfig.json`.
*   **Styling:** Tailwind CSS is integrated for utility-first styling, with global styles in `app/globals.css` and configuration in `postcss.config.mjs`.
*   **Routing:** The project follows the Next.js App Router conventions for file-system based routing (e.g., `app/page.tsx`, `app/src/about/page.tsx`).
*   **Fonts:** Custom fonts are managed using `next/font` for performance and automatic optimization.
