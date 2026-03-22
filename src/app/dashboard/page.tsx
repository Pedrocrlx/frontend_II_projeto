"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import GridIcon from "@/components/landing/GridIcon";
import { DashboardCard, type IconVariant } from "./_components/DashboardCard";

type DashboardCardData = {
  title: string;
  description: string;
  icon: IconVariant;
  href: string;
  isComingSoon?: boolean;
};

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const dashboardCards: DashboardCardData[] = [
    { 
      title: "Overview", 
      description: "View your booking statistics and business metrics", 
      icon: "blue",
      href: "/dashboard/overview",
      isComingSoon: true 
    },
    { 
      title: "Barbers", 
      description: "Manage your barbers and their profiles", 
      icon: "green",
      href: "/dashboard/barbers",
      isComingSoon: false 
    },
    { 
      title: "Services", 
      description: "Manage services and pricing", 
      icon: "purple",
      href: "/dashboard/services",
      isComingSoon: false 
    },
    { 
      title: "Bookings", 
      description: "View and manage customer bookings", 
      icon: "orange",
      href: "/dashboard/bookings",
      isComingSoon: false 
    },
    { 
      title: "Settings", 
      description: "Configure your barbershop details", 
      icon: "indigo",
      href: "/dashboard/settings",
      isComingSoon: true 
    },
    { 
      title: "Billing", 
      description: "Manage your subscription and payments", 
      icon: "pink",
      href: "/dashboard/billing",
      isComingSoon: true 
    },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <GridIcon />
          <p className="text-sm font-bold text-slate-900 tracking-widest uppercase">Loading dashboard</p>
          <p className="mt-2 text-sm text-slate-500">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative font-sans text-slate-900 dark:text-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-md"
            >
              <GridIcon />
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Grid</span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">Account</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[200px]">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm cursor-pointer font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center lg:text-left">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3">Workspace</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-4">Dashboard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">Manage your barbershop, team, and bookings from one centralized workspace.</p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 text-center lg:grid-cols-3 gap-6 lg:gap-8">
          {dashboardCards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              href={card.href}
              isComingSoon={card.isComingSoon}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
