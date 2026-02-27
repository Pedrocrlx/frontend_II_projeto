# Grid - Quick Reference Guide

## Documentation Structure

- **[spec.md](./spec.md)** - Main project specification with tech stack and chunk breakdown
- **[saas-architecture.md](./saas-architecture.md)** - Detailed SaaS architecture, user flows, and technical details
- **[CODING_GUIDELINE.md](./CODING_GUIDELINE.md)** - Development standards and best practices

## Current Status

### Completed (Chunks 0-2)
- Next.js + Bun setup
- PostgreSQL + Prisma ORM
- Public booking page with SSR
- International phone validation (5 countries)
- Smart calendar with availability
- Comprehensive test coverage (42 tests)

### Next Steps (Chunk 3)
- Landing page with hero section
- Pricing page with plan comparison
- Legal pages (Terms, Privacy)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Grid SaaS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Landing Page (/)                                           │
│       ↓                                                     │
│  Sign Up + Email Verification                               │
│       ↓                                                     │
│  Stripe Checkout (14-day trial)                             │
│       ↓                                                     │
│  Onboarding Wizard                                          │
│    1. Create BarberShop (unique slug)                       │
│    2. Add Barbers (1-10)                                    │
│    3. Add Services (1-20)                                   │
│    4. Preview & Launch                                      │
│       ↓                                                     │
│  Admin Dashboard                                            │
│    - Manage Barbers/Services                                │
│    - View Bookings                                          │
│    - Customize Theme (optional)                             │
│    - Billing Management                                     │
│       ↓                                                     │
│  Public Page (/{slug})                                      │
│    - Service listing                                        │
│    - Booking flow                                           │
│    - International support                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Models

### Core Models
- **User** - Supabase auth user (owner)
- **Subscription** - Stripe subscription data
- **BarberShop** - Shop details (linked to User)
- **Barber** - Staff members (max 10 per shop)
- **Service** - Services offered (max 20 per shop)
- **Booking** - Customer appointments

### Relationships
```
User (1) ──→ (1) Subscription
User (1) ──→ (1) BarberShop
BarberShop (1) ──→ (N) Barber
BarberShop (1) ──→ (N) Service
BarberShop (1) ──→ (N) Booking
```

## Authentication Flow

1. **Sign Up** → Supabase creates user
2. **Email Verification** → User confirms email
3. **Plan Selection** → User chooses subscription plan
4. **Stripe Checkout** → Payment (14-day trial)
5. **Onboarding** → Create barbershop
6. **Dashboard Access** → Manage shop

## Subscription Plans

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Price | TBD | TBD | TBD |
| Barbers | 3 | 10 | 10 |
| Services | 10 | 20 | 20 |
| Trial | 14 days | 14 days | 14 days |
| Theme | ❌ | ✅ | ✅ |

## Route Structure

### Public Routes
- `/` - Landing page
- `/pricing` - Pricing page
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/{slug}` - Public barbershop page

### Protected Routes (Auth Required)
- `/auth/signup` - Sign up page
- `/auth/login` - Login page
- `/onboarding` - Onboarding wizard
- `/dashboard` - Admin dashboard
- `/dashboard/barbers` - Manage barbers
- `/dashboard/services` - Manage services
- `/dashboard/bookings` - View bookings
- `/dashboard/settings` - Shop settings
- `/dashboard/billing` - Subscription management
- `/dashboard/customize` - Theme customization (optional)

### API Routes
- `/api/auth/*` - Supabase auth callbacks
- `/api/stripe/create-checkout-session` - Create Stripe checkout
- `/api/stripe/webhook` - Stripe webhook handler
- `/api/onboarding/check-slug` - Slug availability check
- `/api/onboarding/complete` - Complete onboarding
- `/api/barber/[slug]` - Get barbershop data

## Testing Strategy

### Unit Tests
- Phone validation (14 tests)
- Availability calculation (6 tests)
- Slug generation and validation
- Business rule validations

### Integration Tests
- Booking flow (15 tests)
- Cache logic (7 tests)
- Onboarding wizard
- Stripe webhook handling

### E2E Tests (Future)
- Complete user journey
- Payment flow
- Subscription management

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Database commands
bunx prisma migrate dev      # Run migrations
bunx prisma db seed          # Seed database
bunx prisma studio           # Open Prisma Studio
bunx prisma generate         # Generate Prisma Client

# Build for production
bun run build

# Start production server
bun run start
```

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** Redux Toolkit (for theming)
- **HTTP:** Axios
- **Testing:** Jest + React Testing Library
- **Deployment:** Vercel

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Business Rules

### Barbers
- Minimum: 1 required
- Maximum: 10 per shop
- Fields: name (required), description (optional), photo (optional)

### Services
- Minimum: 1 required
- Maximum: 20 per shop
- Fields: name (required), price (required), duration (required)

### Slug
- Unique across all shops
- Format: lowercase, alphanumeric, hyphens
- Length: 3-50 characters
- Auto-generated from shop name
- Reserved: admin, api, auth, dashboard, pricing, etc.

### Subscription
- 14-day free trial
- Credit card required upfront
- Auto-charge after trial
- 7-day grace period on payment failure

## Theme Customization (Optional - Chunk 7)

### Available Options
- Primary color
- Secondary color
- Logo upload
- Real-time preview

### Implementation
- Redux Toolkit for state management
- CSS variables for dynamic theming
- Persisted in database
- Applied to public page

## Metrics to Track

### Business Metrics
- Sign-ups per day/week/month
- Trial-to-paid conversion rate
- Churn rate
- Average revenue per user (ARPU)
- Customer lifetime value (LTV)

### Technical Metrics
- Page load time
- API response time
- Error rate
- Uptime percentage
- Stripe webhook success rate

## Common Issues & Solutions

### Issue: Slug already exists
**Solution:** Auto-append number (e.g., `my-shop-2`)

### Issue: Payment failed during trial
**Solution:** Retry automatically (Stripe Smart Retries)

### Issue: User can't access dashboard
**Solution:** Check subscription status and email verification

### Issue: Public page not updating
**Solution:** Check `revalidatePath()` in server actions

## Support & Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Shadcn UI:** https://ui.shadcn.com

## Roadmap

### MVP (Current Focus)
- [ ] Landing page
- [ ] Auth + Subscription
- [ ] Onboarding wizard
- [ ] Admin dashboard
- [ ] Billing management

### Post-MVP
- [ ] Theme customization
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Analytics dashboard
- [ ] Custom domains
- [ ] Mobile app

### Future
- [ ] Loyalty program
- [ ] Gift cards
- [ ] Product sales
- [ ] Staff scheduling
- [ ] Marketing automation
