"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelect } from "@/components/LanguageSelect";
import GridIcon from "@/components/landing/GridIcon";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  category?: string;
}

// Menu icon component
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

// Close icon component
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

export function DashboardManagementLayout({ 
  children, 
  title, 
  subtitle, 
  category = "" 
}: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <GridIcon />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50 tracking-widest uppercase">{t.dashboard.loadingTitle}</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-md"
            >
              <GridIcon />
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Grid</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3 lg:gap-4">
              <LanguageSelect />
              <ThemeToggle />
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t.dashboard.account}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[200px]">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm cursor-pointer font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-3 lg:px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                {t.dashboard.signOut}
              </button>
            </div>

            {/* Mobile Menu Button */}
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="px-4 py-4 space-y-4">
              {/* User Info */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t.dashboard.account}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.email}</p>
              </div>

              {/* Theme & Language */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LanguageSelect />
                  <ThemeToggle />
                </div>
              </div>

              {/* Sign Out Button */}
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
      <main className="relative z-10 pt-20 sm:pt-28 pb-12 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 sm:mb-6 transition-colors"
          >
            <span aria-hidden="true" className="mr-2">←</span>
            {t.dashboard.backToDashboard}
          </Link>
          <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2 sm:mb-3">{category || t.dashboard.managementCategory}</p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-3 sm:mb-4">{title}</h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
