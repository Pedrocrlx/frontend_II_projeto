"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
              <div className="bg-slate-200 rounded-sm"></div>
              <div className="bg-slate-200 rounded-sm"></div>
              <div className="highlight-square rounded-sm"></div>
              <div className="bg-slate-200 rounded-sm"></div>
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Grid
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-sm font-bold text-slate-900 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              Login
            </Link>
            <Link
              href="#"
              className="text-sm font-bold text-white bg-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
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
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-3 bg-white border-t border-slate-100">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            How it Works
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            Pricing
          </Link>
          <Link
            href="#"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-bold text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-center"
          >
            Login
          </Link>
          <Link
            href="#"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all text-center"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
