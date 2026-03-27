"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelect } from "@/components/LanguageSelect";
import GridIcon from "@/components/landing/GridIcon";
import { DashboardCard, type IconVariant } from "./_components/DashboardCard";
import { userService } from "@/services/userService";

type DashboardCardData = {
  title: string;
  description: string;
  icon: IconVariant;
  href: string;
  isComingSoon?: boolean;
};

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopSlug, setShopSlug] = useState<string | null>(null);

  const dashboardCards: DashboardCardData[] = [
    { title: t.dashboard.cards.barbers.title, description: t.dashboard.cards.barbers.description, icon: "green", href: "/dashboard/barbers", isComingSoon: false },
    { title: t.dashboard.cards.services.title, description: t.dashboard.cards.services.description, icon: "purple", href: "/dashboard/services", isComingSoon: false },
    { title: t.dashboard.cards.bookings.title, description: t.dashboard.cards.bookings.description, icon: "orange", href: "/dashboard/bookings", isComingSoon: false },
    { title: t.dashboard.cards.settings.title, description: t.dashboard.cards.settings.description, icon: "indigo", href: "/dashboard/settings", isComingSoon: false },
    { title: t.dashboard.cards.customize.title, description: t.dashboard.cards.customize.description, icon: "pink", href: "/dashboard/customize", isComingSoon: false },
    { title: t.dashboard.cards.billing.title, description: t.dashboard.cards.billing.description, icon: "orange", href: "/dashboard/billing", isComingSoon: true },
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchShop = async () => {
      if (!isAuthenticated) return;

      try {
        const shopStatus = await userService.getShopStatus();
        setShopSlug(shopStatus.slug);
      } catch (error) {
        console.error("Failed to load shop slug:", error);
      }
    };

    fetchShop();
  }, [isAuthenticated]);

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <GridIcon />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50 tracking-widest uppercase">{t.dashboard.loadingTitle}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.dashboard.loadingSubtitle}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <GridIcon />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50 tracking-widest uppercase">{t.dashboard.redirecting}</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
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

            <div className="hidden sm:flex items-center gap-4">
              <LanguageSelect />
              <ThemeToggle />
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t.dashboard.account}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[200px]">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm cursor-pointer font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                {t.dashboard.signOut}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMobileMenuOpen ? t.dashboard.closeMenu : t.dashboard.openMenu}
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="px-4 py-4 space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t.dashboard.account}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.email}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LanguageSelect />
                  <ThemeToggle />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-sm cursor-pointer font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-center"
              >
                {t.dashboard.signOut}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center lg:text-left">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3">{t.dashboard.workspace}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-4">{t.dashboard.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{t.dashboard.subtitle}</p>

          {shopSlug && (
            <div className="mt-6 inline-flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
              <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                {t.dashboard.publicPage}
              </p>
              <Link
                href={`/${shopSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 break-all"
              >
                /{shopSlug}
              </Link>
            </div>
          )}
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
