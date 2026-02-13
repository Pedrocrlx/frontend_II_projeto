# Start infrastructure (Postgres + Adminer)
up:
	docker compose up -d

# Stop infrastructure
down:
	docker compose down

# Create official migration (Use this when you change schema.prisma)
# It asks for a name, so run it manually in the terminal
db-migrate:
	bunx prisma migrate dev

# Open Prisma Data Studio
studio:
	bunx prisma studio

# Setup project for the first time or after pulling updates
# We add a small sleep to ensure DB is ready before migrating
setup: up
	sleep 5
	bunx prisma migrate dev

# Start the development server only (Fast start)
# Assumes DB is already running
dev:
	bun dev

# If you really want one command for everything (slower boot)
start-all: up
	sleep 3
	bunx prisma migrate dev
	bun dev