import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.log("[OAuth Callback] No code in URL");
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_callback_error`);
  }

  // Determine destination before building the response — we need to set cookies on it
  // Use a mutable ref so the Supabase cookie handler can write to the final response
  let destination = "/onboarding"; // safe default: no shop yet
  const cookiesToForward: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Collect cookies — we'll apply them to the final response after we know the destination
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookiesToForward.push({ name, value, options: options as Record<string, unknown> });
          });
        },
      },
    }
  );

  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  console.log("[OAuth Callback] Exchange result:", { error: error?.message, hasSession: !!data.session });

  if (error || !data.session?.user) {
    console.log("[OAuth Callback] Error:", error?.message);
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_callback_error`);
  }

  const supabaseUser = data.session.user;

  // Check if this user already has a barbershop — determines onboarding state
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { barberShop: { select: { id: true } } },
  });

  const hasShop = !!dbUser?.barberShop;
  destination = hasShop ? "/dashboard" : "/onboarding";

  console.log(`[OAuth Callback] supabaseId=${supabaseUser.id} hasShop=${hasShop} → ${destination}`);

  // Build the final response with the correct destination and forward all session cookies
  const response = NextResponse.redirect(`${origin}${destination}`);
  cookiesToForward.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
