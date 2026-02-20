.PHONY: help
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start infrastructure (Postgres + Adminer for local development)
	docker compose up -d

down: ## Stop infrastructure
	docker compose down

clean:
	docker compose down --volumes --remove-orphans

# Create official migration (Use this when you change schema.prisma)
db-migrate: ## It asks for a name, so run it manually in the terminal
	bunx prisma migrate dev


studio: ## Open Prisma Data Studio to add data on the database
	bunx prisma studio


## We add a small sleep to ensure DB is ready before migrating
setup: up ## Setup project for the first time or after pulling updates
	sleep 5
	bunx prisma migrate dev


start-all: up ## If you really want one command for everything (slower boot)
	sleep 3
	bunx prisma migrate dev
	bun dev