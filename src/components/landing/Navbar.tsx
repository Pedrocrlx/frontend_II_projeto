"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import GridIcon from "./GridIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Login button should not be visible when authenticated also if mobile menu is open, so we can change the login button to dashboard link.
      const loginButton = document.querySelector('a[href="/auth/login"]');
      const freeTrialButton = document.querySelector('a[href="/auth/signup"]');

      if (freeTrialButton) {
        freeTrialButton.className = "hidden";
      }

      if (loginButton) {
        loginButton.setAttribute("href", "/dashboard");
        loginButton.textContent = "Dashboard";
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (mobileMenuOpen && isAuthenticated) {

      // If mobile menu is open and user is authenticated, need to change the login button to dashboard link.
      const loginButton = document.querySelector('a[href="/auth/login"]');
      const freeTrialButton = document.querySelector('a[href="/auth/signup"]');

      if (freeTrialButton) {
        freeTrialButton.className = "hidden";
      }

      if (loginButton) {
        loginButton.setAttribute("href", "/dashboard");
        loginButton.textContent = "Dashboard";
      }
    }
  }, [mobileMenuOpen, isAuthenticated]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <GridIcon />
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Grid
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Pricing
            </Link>
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm font-bold text-slate-900 dark:text-slate-50 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              Login
            </Link>
            <Link
              href="/auth/signup" id="freeTrialButton"
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              Start Free Trial
            </Link>
            {isAuthenticated && (
              <Link
                href="#"
                onClick={handleSignOut}
                className="w-full sm:w-auto block px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer dark:hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all text-center"
              >
                Sign out
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            How it Works
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-bold text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
          >
            Login
          </Link>
          {!isAuthenticated && (
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all text-center"
            >
              Start Free Trial
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/"
              onClick={handleSignOut}
              className="w-full sm:w-auto block px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all text-center"
            >
              Sign out
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
