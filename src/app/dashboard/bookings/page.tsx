"use client";

import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";

export default function BookingsPage() {
  return (
    <DashboardManagementLayout
      title="Bookings"
      subtitle="View and manage your appointments calendar."
    >
      {/* Content Placeholder for Chunk 6 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 dark:border-blue-900">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M9.125 15h.375v.375h-.375V15zM14.5 15h.375v.375h-.375V15z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Calendar View
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The booking calendar is currently under development as part of Chunk
          6. Soon you'll be able to manage all appointments here.
        </p>
      </div>
    </DashboardManagementLayout>
  );
}
