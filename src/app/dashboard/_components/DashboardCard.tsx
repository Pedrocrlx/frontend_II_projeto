"use client";

import { type ReactElement } from "react";
import Link from "next/link";

export type IconVariant = "blue" | "green" | "purple" | "orange" | "indigo" | "pink";

interface FeatureIconProps {
  variant: IconVariant;
}

function FeatureIcon({ variant }: FeatureIconProps) {
  const styles: Record<IconVariant, string> = {
    blue: "text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30",
    green: "text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30",
    purple: "text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30",
    orange: "text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30",
    indigo: "text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30",
    pink: "text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/30",
  };

  const icons: Record<IconVariant, ReactElement> = {
    blue: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
    green: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    ),
    purple: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    ),
    orange: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M9.125 15h.375v.375h-.375V15zM14.5 15h.375v.375h-.375V15z"
      />
    ),
    indigo: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
      />
    ),
    pink: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    ),
  };

  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${styles[variant]}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        {icons[variant]}
      </svg>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: IconVariant;
  href: string;
  isComingSoon?: boolean;
}

export function DashboardCard({
  title,
  description,
  icon,
  href,
  isComingSoon = false,
}: DashboardCardProps) {
  const CardContent = (
    <div className="group relative rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-2xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 transition-shadow h-full">
      <div className="flex items-start justify-between mb-6">
        <FeatureIcon variant={icon} />
        {isComingSoon && (
          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
            Soon
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">{title}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-10 rounded-b-3xl transition-opacity" />
    </div>
  );

  if (isComingSoon) {
    return <div className="cursor-default">{CardContent}</div>;
  }

  return (
    <Link href={href} className="block h-full group">
      {CardContent}
    </Link>
  );
}
