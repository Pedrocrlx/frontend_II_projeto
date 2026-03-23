const en = {
  // Navbar
  nav: {
    features: "Features",
    howItWorks: "How it Works",
    pricing: "Pricing",
    login: "Login",
    dashboard: "Dashboard",
    startFreeTrial: "Start Free Trial",
    signOut: "Sign out",
  },
  // Landing — Hero
  hero: {
    badge: "Smart Scheduling for Barbershops",
    headline: "Your Barbershop Schedule,",
    headlineAccent: "Perfectly Organized",
    subheadline: "Grid gives your barbershop a professional booking page with smart calendar management, international support, and real-time availability.",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "See How It Works",
    noCreditCard: "No credit card required",
    trustedBy: "Trusted by 500+ barbershops worldwide",
  },
  // Landing — Features
  features: {
    title: "Everything you need to run a modern barbershop",
    subtitle: "Grid combines smart scheduling, international support, and professional branding in one platform.",
    items: {
      calendar: {
        title: "Smart Grid Calendar",
        description: "Intelligent scheduling that prevents double-bookings and optimizes your team's time. Real-time availability across all barbers.",
      },
      international: {
        title: "International Ready",
        description: "Support for customers from Portugal, Brazil, UK, Germany, and France with local phone validation and formatting.",
      },
      instant: {
        title: "Instant Setup",
        description: "Get your barbershop online in minutes. Custom URL, branded page, and booking system ready to go.",
      },
    },
  },
  // Landing — Stats
  stats: {
    shops: "Active Barbershops",
    bookings: "Bookings Managed",
    countries: "Countries Supported",
    uptime: "Uptime",
  },
  // Landing — HowItWorks
  howItWorks: {
    title: "Up and running in minutes",
    subtitle: "Three simple steps to get your barbershop online.",
    steps: {
      setup: { title: "Create your shop", description: "Sign up and set up your barbershop profile with your unique URL." },
      configure: { title: "Add your team", description: "Add barbers, services, and pricing. Everything in one place." },
      launch: { title: "Go live", description: "Share your booking link and start accepting appointments instantly." },
    },
  },
  // Landing — Pricing
  pricing: {
    title: "Simple, transparent pricing",
    subtitle: "Start free for 14 days. No credit card required.",
    trial: "14-day free trial",
    monthly: "/ month",
    ctaStart: "Start Free Trial",
    ctaContact: "Contact Sales",
    plans: {
      basic: { name: "Basic", description: "Perfect for solo barbers" },
      pro: { name: "Pro", description: "For growing barbershops" },
      enterprise: { name: "Enterprise", description: "For large operations" },
    },
  },
  // Landing — FinalCTA
  finalCta: {
    title: "Ready to organize your barbershop?",
    subtitle: "Join hundreds of barbershops already using Grid.",
    cta: "Start Free Trial",
    noCreditCard: "No credit card required · Cancel anytime",
  },
  // Landing — Footer
  footer: {
    product: "Product",
    company: "Company",
    legal: "Legal",
    links: {
      features: "Features",
      pricing: "Pricing",
      about: "About",
      blog: "Blog",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact",
    },
    rights: "All rights reserved.",
  },
  // Dashboard
  dashboard: {
    workspace: "Workspace",
    title: "Dashboard",
    subtitle: "Manage your barbershop, team, and bookings from one centralized workspace.",
    account: "Account",
    signOut: "Sign out",
    loadingTitle: "Loading dashboard",
    loadingSubtitle: "Preparing your workspace…",
    cards: {
      overview: { title: "Overview", description: "View your booking statistics and business metrics" },
      barbers: { title: "Barbers", description: "Manage your barbers and their profiles" },
      services: { title: "Services", description: "Manage services and pricing" },
      bookings: { title: "Bookings", description: "View and manage customer bookings" },
      settings: { title: "Settings", description: "Configure your barbershop details" },
      billing: { title: "Billing", description: "Manage your subscription and payments" },
    },
  },
} as const;

export default en;

// Derive the type with string values (not string literals) so translations can be overridden
export type Translations = {
  [K in keyof typeof en]: {
    [P in keyof (typeof en)[K]]: (typeof en)[K][P] extends object
      ? { [Q in keyof (typeof en)[K][P]]: (typeof en)[K][P][Q] extends object
          ? { [R in keyof (typeof en)[K][P][Q]]: string }
          : string }
      : string;
  };
};
