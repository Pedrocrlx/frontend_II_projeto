# Grid SaaS Architecture

## 1. Overview

Grid is a multi-tenant SaaS platform where barbershop owners can create and manage their own booking websites with organized scheduling. This document outlines the complete user journey, technical architecture, and business logic.

**Brand Identity:**
- Name: Grid
- Tagline: "Your schedule, organized"
- Concept: Represents the perfect intersection of time slots and appointments - bringing structure and precision to barbershop scheduling.

## 2. User Journey

### 2.1 Customer Acquisition Flow

```
Landing Page (/)
    ↓
Pricing Page (/pricing)
    ↓
Sign Up (/auth/signup)
    ↓
Email Verification
    ↓
Plan Selection + Stripe Checkout
    ↓
Payment Success Webhook
    ↓
Onboarding Wizard (/onboarding)
    ↓
Dashboard (/dashboard)
    ↓
Public Page Live (/{slug})
```

### 2.2 Onboarding Wizard Steps

**Step 1: Create BarberShop**
- Shop Name (required)
- Slug (unique, auto-generated from name, editable)
- Description (optional)
- Phone / WhatsApp (optional)
- Address / Location (optional)
- Logo upload (optional, Supabase Storage)
- Slug validation (check uniqueness in real-time)

**Step 2: Add Barbers**
- Name (required)
- Specialty (optional)
- Phone / WhatsApp (required)
- Instagram handle (optional)
- Photo upload (optional, Supabase Storage)
- Minimum: 1 barber required
- Maximum: 10 barbers per shop

**Step 3: Add Services**
- Service Name (required)
- Price (required)
- Duration in minutes (required)
- Minimum: 1 service required
- Maximum: 20 services per shop

**Step 4: Preview & Launch**
- Preview public page
- Confirm and activate
- Redirect to Dashboard

## 3. Subscription Plans

### 3.1 Plan Structure (To Be Defined)

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Monthly Price | TBD | TBD | TBD |
| Max Barbers | 3 | 10 | 10 |
| Max Services | 10 | 20 | 20 |
| Bookings/Month | Unlimited | Unlimited | Unlimited |
| Custom Theme | ❌ | ✅ | ✅ |
| Analytics | Basic | Advanced | Advanced |
| Support | Email | Priority | Dedicated |
| Free Trial | 14 days | 14 days | 14 days |

### 3.2 Trial Period

- **Duration:** 14 days free trial
- **Credit Card:** Required upfront (not charged during trial)
- **Features:** Full access to selected plan features
- **Cancellation:** Can cancel anytime during trial (no charge)
- **Conversion:** Auto-charge after trial ends if not cancelled

## 4. Database Schema Updates

### 4.1 New Tables

```prisma
model User {
  id            String      @id @default(uuid())
  email         String      @unique
  supabaseId    String      @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  barberShop    BarberShop?
  subscription  Subscription?
}

model Subscription {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  
  stripeCustomerId      String   @unique
  stripeSubscriptionId  String   @unique
  stripePriceId         String
  
  plan              String   // "basic", "pro", "enterprise"
  status            String   // "trialing", "active", "canceled", "past_due"
  
  trialEndsAt       DateTime?
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Update existing BarberShop model
model BarberShop {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  slug        String   @unique
  name        String
  description String?
  
  // Contact & social
  phone       String?   // WhatsApp / phone number
  address     String?
  instagram   String?   // Optional, added post-onboarding in dashboard

  // Theme customization (for Pro+ plans)
  primaryColor    String?
  secondaryColor  String?
  logoUrl         String?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  services    Service[]
  barbers     Barber[]
  bookings    Booking[]
}

model Barber {
  id          String   @id @default(uuid())
  barberShopId String
  barberShop  BarberShop @relation(fields: [barberShopId], references: [id])
  
  name        String
  description String?
  imageUrl    String?
  
  // Contact & social
  phone       String?   // Required during onboarding
  instagram   String?   // Optional
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 4.2 Business Rules

**Barber Limits:**
- Minimum: 1 barber required
- Maximum: 10 barbers per shop
- Validation on create/update operations

**Service Limits:**
- Minimum: 1 service required
- Maximum: 20 services per shop
- Validation on create/update operations

**Slug Validation:**
- Must be unique across all barbershops
- Format: lowercase, alphanumeric, hyphens only
- Length: 3-50 characters
- Reserved slugs: admin, api, auth, dashboard, pricing, etc.

## 5. Authentication & Authorization

### 5.1 Supabase Auth Integration

**Sign Up Flow:**
1. User enters email + password
2. Supabase creates auth user
3. Email verification sent
4. User verifies email
5. Redirect to plan selection

**Login Flow:**
1. User enters credentials
2. Supabase validates
3. Check subscription status
4. Redirect to dashboard or onboarding

### 5.2 Protected Routes

```typescript
// Middleware protection
/dashboard/*     → Requires: authenticated + active subscription
/onboarding/*    → Requires: authenticated + no barbershop
/[slug]/*        → Public (no auth required)
/                → Public landing page
/pricing         → Public pricing page
```

### 5.3 Authorization Rules

**User can only:**
- View/Edit their own BarberShop
- Manage their own Barbers/Services
- View bookings for their shop
- Update their subscription

**Prisma RLS (Row Level Security):**
```typescript
// All queries must filter by userId
const barberShop = await prisma.barberShop.findUnique({
  where: { 
    userId: session.user.id,
    id: barberShopId 
  }
});
```

## 6. Stripe Integration

### 6.1 Checkout Flow

```typescript
// 1. Create Stripe Checkout Session
POST /api/stripe/create-checkout-session
Body: { priceId: "price_xxx", userId: "user_xxx" }

// 2. Redirect to Stripe Checkout
window.location.href = session.url

// 3. Handle Success/Cancel
Success: /onboarding?session_id={CHECKOUT_SESSION_ID}
Cancel: /pricing
```

### 6.2 Webhooks

**Required Events:**
- `checkout.session.completed` → Create subscription record
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_succeeded` → Confirm payment
- `invoice.payment_failed` → Handle failed payment

**Webhook Endpoint:**
```typescript
POST /api/stripe/webhook
- Verify signature
- Handle event type
- Update database
- Return 200 OK
```

### 6.3 Subscription Management

**User Dashboard Actions:**
- View current plan
- Upgrade/Downgrade plan
- Cancel subscription (at period end)
- Update payment method
- View billing history

## 7. Onboarding Wizard Implementation

### 7.1 State Management

```typescript
// Onboarding uses local useState — no Redux/Context needed
// All wizard state lives in the page component
const [currentStep, setCurrentStep] = useState(1);
const [shopData, setShopData] = useState({ name: "", slug: "", description: "", phone: "", address: "" });
const [barbers, setBarbers] = useState<BarberInput[]>([{ name: "", specialty: "", phone: "", instagram: "" }]);
const [services, setServices] = useState<ServiceInput[]>([{ name: "", price: "", duration: "30" }]);
```

### 7.2 Validation Rules

**Step 1 (BarberShop):**
- Name: required, 3-100 chars
- Slug: required, unique, 3-50 chars, lowercase-hyphen format
- Description: optional, max 500 chars

**Step 2 (Barbers):**
- Minimum 1 barber
- Maximum 10 barbers
- Name: required, 2-100 chars
- Description: optional, max 200 chars

**Step 3 (Services):**
- Minimum 1 service
- Maximum 20 services
- Name: required, 2-100 chars
- Price: required, > 0
- Duration: required, 15-180 minutes (in 15-min increments)

### 7.3 API Endpoints

```typescript
// Check slug availability
GET /api/onboarding/check-slug?slug=my-barbershop
Response: { available: boolean, suggestion?: string }

// Create complete barbershop (atomic transaction)
POST /api/onboarding/complete
Body: OnboardingState
Response: { barberShopId: string, slug: string }
```

## 8. Landing Page Structure

### 8.1 Sections

1. **Hero Section**
   - Headline: "Your Barbershop, Online in Minutes"
   - Subheadline: "Create a professional booking website for your barbershop"
   - CTA: "Start Free Trial"
   - Hero Image/Video

2. **Features Section**
   - International booking support
   - Smart calendar with availability
   - Mobile-responsive design
   - Easy customization

3. **How It Works**
   - Step 1: Sign up and choose a plan
   - Step 2: Add your barbers and services
   - Step 3: Share your booking link
   - Step 4: Start receiving bookings

4. **Pricing Section**
   - Plan comparison table
   - 14-day free trial badge
   - CTA buttons for each plan

5. **Testimonials** (Future)
   - Customer success stories

6. **FAQ Section**
   - Common questions about the platform

7. **Footer**
   - Links: About, Contact, Terms, Privacy
   - Social media links

### 8.2 Pricing Page

**Layout:**
- Plan cards (Basic, Pro, Enterprise)
- Feature comparison table
- FAQ specific to pricing
- CTA: "Start Free Trial"

## 9. Dashboard Structure

### 9.1 Navigation

```
Dashboard
├── Barbers (CRUD)
├── Services (CRUD)
├── Bookings (calendar view, list view)
├── Customization (theme, colors, logo)
├── Settings (shop details, slug)
└── Billing (subscription, invoices)
```

## 10. Technical Considerations

### 10.1 Slug Generation

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
    .substring(0, 50);               // Max 50 chars
}

// Check uniqueness and suggest alternatives
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

### 10.2 Reserved Slugs

```typescript
const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'dashboard', 'pricing', 'about',
  'contact', 'terms', 'privacy', 'help', 'support', 'blog',
  'login', 'signup', 'logout', 'onboarding', 'billing'
];
```

### 10.3 Rate Limiting

**Public Pages:**
- 100 requests per minute per IP

**API Endpoints:**
- 60 requests per minute per user

**Stripe Webhooks:**
- No rate limit (verified by signature)

### 10.4 Error Handling

**Subscription Expired:**
- Redirect to billing page
- Show banner: "Your subscription has expired"
- Disable dashboard access
- Keep public page active for 7 days grace period

**Payment Failed:**
- Email notification
- Dashboard banner
- Retry payment automatically (Stripe Smart Retries)

## 11. Future Enhancements

### 11.1 Phase 2 Features

- Custom domain support (e.g., `booking.mybarbershop.com`)
- Email notifications for bookings
- SMS reminders (Twilio integration)
- Analytics dashboard
- Customer reviews and ratings
- Multi-language support
- Mobile app (React Native)

### 11.2 Phase 3 Features

- Loyalty program
- Gift cards
- Product sales (shampoos, pomades, etc.)
- Staff scheduling and time-off management
- Inventory management
- Marketing automation (email campaigns)

## 12. Security Considerations

### 12.1 Data Protection

- All passwords hashed (Supabase handles this)
- Sensitive data encrypted at rest
- HTTPS only (enforced)
- CSRF protection (Next.js built-in)
- XSS protection (React escaping)

### 12.2 Compliance

- GDPR compliance (EU users)
- Data export functionality
- Account deletion (right to be forgotten)
- Privacy policy and terms of service

### 12.3 Monitoring

- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Uptime monitoring (UptimeRobot)
- Stripe webhook monitoring

## 13. Development Priorities

### Critical Path (MVP):

1. ✅ Public booking page (DONE - Chunk 2)
2. ✅ Landing page + Pricing page (DONE - Chunk 3)
3. ✅ Supabase Auth integration (DONE - Chunk 4)
4. 🔄 Stripe integration (checkout + webhooks)
5. ✅ Onboarding wizard (DONE - Chunk 5)
6. 🔄 Admin dashboard (basic CRUD)
7. 🔄 Subscription management

### Nice to Have (Post-MVP):

- Theme customization (Redux)
- Analytics dashboard
- Email notifications
- Custom domains
- Mobile app

## 14. Testing Strategy

### 14.1 Unit Tests

- Slug generation and validation
- Subscription status checks
- Business rule validations (limits)

### 14.2 Integration Tests

- Complete onboarding flow
- Stripe webhook handling
- Auth flow (signup, login, logout)

### 14.3 E2E Tests

- User journey: signup → onboarding → dashboard → public page
- Payment flow: plan selection → checkout → success

### 14.4 Manual Testing

- Stripe test mode (test cards)
- Email verification flow
- Subscription cancellation
- Trial expiration

## 15. Deployment Checklist

### Pre-Launch:

- [ ] Stripe production keys configured
- [ ] Supabase production database
- [ ] Email service configured (SendGrid/Resend)
- [ ] Domain configured and SSL active
- [ ] Privacy policy and terms published
- [ ] Error monitoring active (Sentry)
- [ ] Backup strategy implemented
- [ ] Load testing completed

### Post-Launch:

- [ ] Monitor Stripe webhooks
- [ ] Monitor error rates
- [ ] Monitor conversion rates
- [ ] Customer feedback collection
- [ ] Performance optimization
