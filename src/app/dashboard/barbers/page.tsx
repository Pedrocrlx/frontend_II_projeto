"use client";

import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";

export default function BarbersPage() {
  return (
    <DashboardManagementLayout 
      title="Barbers" 
      subtitle="Manage your team of professionals and their availability."
    >
        {/* Content Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-100 dark:border-green-900">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Team Management</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Add new barbers, edit their profiles, and set individual schedules. This feature is coming soon.
            </p>
        </div>
    </DashboardManagementLayout>
  );
}
