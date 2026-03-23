# Grid - Architecture Summary

## Vision

Grid is a multi-tenant SaaS platform where barbershop owners can create professional booking websites with organized scheduling. The platform brings structure and precision to appointment management through smart calendar organization and international booking support.

**Brand Identity:**
- Name: Grid
- Tagline: "Your schedule, organized"
- Concept: The perfect intersection of time slots and appointments

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            GRID SAAS                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC LAYER (No Auth)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Landing Page (/)              Pricing (/pricing)                   │
│  ├─ Hero Section               ├─ Plan Comparison                   │
│  ├─ Features                   ├─ 14-day Trial Badge                │
│  ├─ How It Works               └─ CTA: Start Trial                  │
│  └─ CTA: Start Trial                                                │
│                                                                     │
│  Public Barbershop (/{slug})   Legal Pages                          │
│  ├─ Service Listing            ├─ Terms of Service                  │
│  ├─ Booking Flow               └─ Privacy Policy                    │
│  ├─ Smart Calendar                                                  │
│  └─ International Phone                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Supabase Auth                                                      │
│  ├─ Sign Up + Email Verification                                    │
│  ├─ Login / Logout                                                  │
│  ├─ Password Reset                                                  │
│  └─ Session Management                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Stripe Integration                                                 │
│  ├─ Checkout Session (14-day trial)                                 │
│  ├─ Webhook Handler                                                 │
│  │   ├─ checkout.session.completed                                  │
│  │   ├─ customer.subscription.updated                               │
│  │   ├─ customer.subscription.deleted                               │
│  │   └─ invoice.payment_failed                                      │
│  └─ Subscription Management                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ONBOARDING LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Multi-Step Wizard (/onboarding)                                    │
│                                                                     │
│  Step 1: Create BarberShop                                          │
│  ├─ Shop Name (required)                                            │
│  ├─ Slug (unique, auto-generated, accent removal)                   │
│  ├─ Description (optional)                                          │
│  ├─ Phone / WhatsApp (optional)                                     │
│  └─ Address (optional)                                              │
│                                                                     │
│  Step 2: Add Barbers (1-10)                                         │
│  ├─ Name (required)                                                 │
│  ├─ Specialty/Description (optional)                                │
│  ├─ Phone / WhatsApp (required)                                     │
│  ├─ Instagram (optional)                                            │
│  └─ Photo Upload (Supabase Storage)                                 │
│                                                                     │
│  Step 3: Add Services (1-20)                                        │
│  ├─ Service Name (required)                                         │
│  ├─ Price (required)                                                │
│  └─ Duration (required)                                             │
│                                                                     │
│  Step 4: Preview & Launch                                           │
│  ├─ Preview Public Page                                             │
│  └─ Activate BarberShop                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD (Protected)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Dashboard (/dashboard)                                             │
│  ├─ Overview (metrics, recent bookings)                             │
│  ├─ Barbers Management (CRUD, max 10)                               │
│  ├─ Services Management (CRUD, max 20)                              │
│  ├─ Bookings View (calendar, list)                                  │
│  ├─ Settings (shop details, slug)                                   │
│  ├─ Billing (subscription, invoices)                                │
│  └─ Customize (theme, colors, logo) [Optional]                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  User    │────▶│  Supabase    │────▶│  Database    │
│ (Owner)  │     │    Auth      │     │  (Postgres)  │
└──────────┘     └──────────────┘     └──────────────┘
     │                                        │
     │                                        │
     ▼                                        ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Stripe  │────▶│ Subscription │────▶│  BarberShop  │
│ Checkout │     │    Record    │     │   + Slug     │
└──────────┘     └──────────────┘     └──────────────┘
                                              │
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                        ▼                     ▼                     ▼
                 ┌──────────┐         ┌──────────┐         ┌──────────┐
                 │ Barbers  │         │ Services │         │ Bookings │
                 │ (max 10) │         │ (max 20) │         │(unlimited)│
                 └──────────┘         └──────────┘         └──────────┘
```

## Database Schema

```sql
-- Core Tables
User
├─ id (uuid, PK)
├─ email (unique)
├─ supabaseId (unique)
└─ timestamps

Subscription
├─ id (uuid, PK)
├─ userId (FK → User)
├─ stripeCustomerId (unique)
├─ stripeSubscriptionId (unique)
├─ plan (basic/pro/enterprise)
├─ status (trialing/active/canceled)
├─ trialEndsAt
└─ timestamps

BarberShop
├─ id (uuid, PK)
├─ userId (FK → User, unique)
├─ slug (unique)
├─ name
├─ description
├─ phone (optional)
├─ address (optional)
├─ instagram (optional, dashboard-only)
├─ primaryColor (optional)
├─ secondaryColor (optional)
├─ logoUrl (optional)
└─ timestamps

Barber
├─ id (uuid, PK)
├─ barberShopId (FK → BarberShop)
├─ name
├─ description
├─ phone (optional, required during onboarding)
├─ instagram (optional)
├─ imageUrl
└─ timestamps

Service
├─ id (uuid, PK)
├─ barberShopId (FK → BarberShop)
├─ name
├─ price
├─ duration
└─ timestamps

Booking
├─ id (uuid, PK)
├─ barberShopId (FK → BarberShop)
├─ barberId (FK → Barber)
├─ serviceId (FK → Service)
├─ customerName
├─ customerPhone
├─ customerCountry
├─ startTime
├─ endTime
└─ timestamps
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                           │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth                                              │
│  ├─ JWT tokens (httpOnly cookies)                           │
│  ├─ Email verification required                             │
│  └─ Password reset flow                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION                            │
├─────────────────────────────────────────────────────────────┤
│  Middleware Protection                                      │
│  ├─ /dashboard/* → Auth + Active Subscription               │
│  ├─ /onboarding/* → Auth + No BarberShop                    │
│  └─ /{slug}/* → Public (no auth)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY                       │
├─────────────────────────────────────────────────────────────┤
│  Database Queries                                           │
│  ├─ All queries filtered by userId                          │
│  ├─ User can only access their own data                     │
│  └─ Public pages query by slug only                         │
└─────────────────────────────────────────────────────────────┘
```

## Payment Flow

```
User Selects Plan
       ↓
Create Stripe Checkout Session
       ↓
Redirect to Stripe Checkout
       ↓
User Enters Payment Info
       ↓
Stripe Processes Payment
       ↓
Webhook: checkout.session.completed
       ↓
Create Subscription Record
       ↓
Start 14-day Trial
       ↓
Redirect to Onboarding
       ↓
User Creates BarberShop
       ↓
Dashboard Access Granted
       ↓
Trial Ends (Day 14)
       ↓
Auto-charge Subscription
       ↓
Active Subscription
```

## Theme System (Optional - Chunk 7)

```
┌─────────────────────────────────────────────────────────────┐
│                    THEME CUSTOMIZATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dashboard Customizer                                       │
│  ├─ Color Picker (Primary)                                  │
│  ├─ Color Picker (Secondary)                                │
│  ├─ Logo Upload                                             │
│  └─ Real-time Preview                                       │
│                                                             │
│  Redux Store (themeSlice)                                   │
│  ├─ Current theme state                                     │
│  ├─ Preview mode toggle                                     │
│  └─ Save to database                                        │
│                                                             │
│  Public Page Application                                    │
│  ├─ Load theme from database                                │
│  ├─ Inject CSS variables                                    │
│  │   ├─ --primary: #hexcolor                                │
│  │   └─ --secondary: #hexcolor                              │
│  └─ Display custom logo                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Performance
- **Caching:** 5-minute cache for availability data
- **CDN:** Static assets served via Vercel Edge Network
- **Database:** Connection pooling via Prisma
- **Images:** Optimized via Next.js Image component

### Limits
- **Barbers:** Max 10 per shop (prevents UI/DB overload)
- **Services:** Max 20 per shop (reasonable catalog size)
- **Bookings:** Unlimited (core business value)
- **Rate Limiting:** 60 req/min per user, 100 req/min per IP

### Monitoring
- **Errors:** Sentry for error tracking
- **Performance:** Vercel Analytics
- **Uptime:** UptimeRobot
- **Webhooks:** Stripe webhook monitoring

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
├─────────────────────────────────────────────────────────────┤
│  Next.js App (Edge Functions)                               │
│  ├─ SSR for public pages                                    │
│  ├─ API routes                                              │
│  └─ Static assets (CDN)                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  ├─ Connection pooling                                      │
│  ├─ Automated backups                                       │
│  └─ Row Level Security                                      │
│                                                             │
│  Auth Service                                               │
│  ├─ JWT token management                                    │
│  └─ Email verification                                      │
│                                                             │
│  Storage                                                    │
│  ├─ Barber photos                                           │
│  └─ Shop logos                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        STRIPE                               │
├─────────────────────────────────────────────────────────────┤
│  Payment Processing                                         │
│  ├─ Checkout sessions                                       │
│  ├─ Subscription management                                 │
│  ├─ Webhook events                                          │
│  └─ Invoice generation                                      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Checklist

### Completed (Chunks 0-5)
- [x] Next.js + Bun setup
- [x] PostgreSQL + Prisma
- [x] Public booking page
- [x] International phone validation (PT, BR, GB, DE, FR)
- [x] Smart calendar with availability filtering
- [x] Landing page (Hero, Features, How It Works, Stats)
- [x] Pricing page (plan comparison, 14-day trial badge, FAQ)
- [x] Legal pages (Terms, Privacy, Contact)
- [x] Supabase Auth (signup, login, logout, email verification, password reset)
- [x] Protected route middleware
- [x] AuthContext + useAuth hook
- [x] User model + UserService (linked to Supabase)
- [x] Subscription model (Stripe schema ready)
- [x] Dark theme (next-themes, ThemeProvider, ThemeToggle)
- [x] Test coverage (99 tests, 11 suites)
- [x] Onboarding wizard (4-step: shop, team, services, launch)
- [x] Schema: phone/address on BarberShop, phone/instagram on Barber

### Pending (Chunk 4 — Stripe)
- [ ] Checkout session creation
- [ ] Webhook handling (checkout.session.completed, subscription events)
- [ ] Payment processing

### Upcoming (Chunks 6-8)
- [ ] Admin dashboard (CRUD, billing, settings)
- [ ] Theme customization — Redux themeSlice (optional)
- [ ] Deployment & CI/CD

## Success Metrics

### Business KPIs
- Sign-ups per week
- Trial-to-paid conversion rate (target: >40%)
- Monthly recurring revenue (MRR)
- Churn rate (target: <5%)
- Customer lifetime value (LTV)

### Technical KPIs
- Page load time (target: <2s)
- API response time (target: <500ms)
- Uptime (target: 99.9%)
- Error rate (target: <0.1%)
- Test coverage (target: >80%)

## Documentation Index

1. **[1_QUICK_REFERENCE.md](./1_QUICK_REFERENCE.md)** - Quick reference guide
2. **[2_spec.md](./2_spec.md)** - Main specification
3. **[3_saas-architecture.md](./3_saas-architecture.md)** - Detailed architecture
4. **[4_ARCHITECTURE_SUMMARY.md](./4_ARCHITECTURE_SUMMARY.md)** - This document
5. **[5_TEST_COVERAGE.md](./5_TEST_COVERAGE.md)** - Test coverage overview
6. **[6_CODING_GUIDELINE.md](./6_CODING_GUIDELINE.md)** - Development standards

---

**Last Updated:** 2026-03-17
**Version:** 0.5.0
**Status:** Chunks 0–5 Complete (Stripe pending), Chunk 6 Next
**Brand:** Grid - Your schedule, organized