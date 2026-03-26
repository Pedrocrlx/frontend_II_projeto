import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

interface BarberInput {
  name: string;
  specialty?: string;
  phone: string;
  instagram?: string;
  imageUrl?: string;
}

interface ServiceInput {
  name: string;
  price: string;
  duration: string;
}

interface OnboardingPayload {
  shop: {
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  barbers: BarberInput[];
  services: ServiceInput[];
}

const RESERVED_SLUGS = [
  "admin", "api", "auth", "dashboard", "pricing", "about",
  "contact", "terms", "privacy", "help", "support", "blog",
  "login", "signup", "logout", "onboarding", "billing",
];

export async function POST(req: NextRequest) {
  try {
    // Authenticate via Supabase JWT from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: OnboardingPayload = await req.json();
    const { shop, barbers, services } = body;

    // --- Validation ---
    if (!shop.name?.trim() || shop.name.trim().length < 3) {
      return NextResponse.json({ error: "Shop name must be at least 3 characters" }, { status: 400 });
    }

    const slug = shop.slug?.trim().toLowerCase();
    if (!slug || slug.length < 3 || slug.length > 50) {
      return NextResponse.json({ error: "Slug must be between 3 and 50 characters" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug must only contain lowercase letters, numbers, and hyphens" }, { status: 400 });
    }
    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "This slug is reserved" }, { status: 400 });
    }

    const validBarbers = barbers.filter((b) => b.name.trim() && b.phone.trim());
    if (validBarbers.length === 0) {
      return NextResponse.json({ error: "At least one barber with name and phone is required" }, { status: 400 });
    }

    const validServices = services.filter((s) => s.name.trim() && s.price.trim());
    if (validServices.length === 0) {
      return NextResponse.json({ error: "At least one service with name and price is required" }, { status: 400 });
    }

    // --- Resolve internal User from supabaseId, create/update if needed ---
    // First, try to find by supabaseId
    let dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    // If not found by supabaseId, check if user exists by email (might be from old flow)
    if (!dbUser) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: supabaseUser.email! },
      });

      if (existingUserByEmail) {
        // User exists with this email but no supabaseId - update it
        console.log(`Linking existing user ${supabaseUser.email} to Supabase ID`);
        dbUser = await prisma.user.update({
          where: { email: supabaseUser.email! },
          data: { supabaseId: supabaseUser.id },
        });
      } else {
        // Brand new user - create it
        console.log(`First login for ${supabaseUser.email} — creating User record`);
        dbUser = await prisma.user.create({
          data: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email!,
          },
        });
      }
    }

    // --- Check slug uniqueness ---
    const existingShop = await prisma.barberShop.findUnique({ where: { slug } });
    if (existingShop) {
      return NextResponse.json({ error: "This slug is already taken" }, { status: 409 });
    }

    // --- Atomic transaction: create shop + barbers + services ---
    const barberShop = await prisma.$transaction(async (tx) => {
      const createdShop = await tx.barberShop.create({
        data: {
          userId: dbUser.id,
          slug,
          name: shop.name.trim(),
          description: shop.description?.trim() || null,
          phone: shop.phone?.trim() || null,
          address: shop.address?.trim() || null,
          logoUrl: shop.logoUrl?.trim() || null,
          isActive: true,
        },
      });

      console.log(`BarberShop created: ${createdShop.slug} (userId: ${dbUser.id})`);

      await tx.barber.createMany({
        data: validBarbers.map((b) => ({
          barberShopId: createdShop.id,
          name: b.name.trim(),
          description: b.specialty?.trim() || null,
          phone: b.phone.trim(),
          instagram: b.instagram?.trim() || null,
          imageUrl: b.imageUrl?.trim() || null,
        })),
      });

      await tx.service.createMany({
        data: validServices.map((s) => ({
          barberShopId: createdShop.id,
          name: s.name.trim(),
          price: parseFloat(s.price),
          duration: parseInt(s.duration, 10),
        })),
      });

      return createdShop;
    });

    return NextResponse.json(
      { barberShopId: barberShop.id, slug: barberShop.slug },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error completing onboarding:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
