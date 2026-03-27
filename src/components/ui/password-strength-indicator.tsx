"use client";

import { useMemo } from "react";
import { calculatePasswordStrength, type PasswordStrength } from "@/lib/utils/passwordStrength";

interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
  className?: string;
}

const strengthColors = {
  "very-weak": {
    bg: "bg-red-500 dark:bg-red-600",
    text: "text-red-600 dark:text-red-400",
    bars: 1,
  },
  weak: {
    bg: "bg-orange-500 dark:bg-orange-600",
    text: "text-orange-600 dark:text-orange-400",
    bars: 2,
  },
  fair: {
    bg: "bg-yellow-500 dark:bg-yellow-600",
    text: "text-yellow-600 dark:text-yellow-400",
    bars: 3,
  },
  good: {
    bg: "bg-blue-500 dark:bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    bars: 4,
  },
  strong: {
    bg: "bg-green-500 dark:bg-green-600",
    text: "text-green-600 dark:text-green-400",
    bars: 5,
  },
};

export function PasswordStrengthIndicator({
  password,
  showLabel = true,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const strength: PasswordStrength = useMemo(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  // Don't show indicator if password is empty
  if (!password) {
    return null;
  }

  const colorConfig = strengthColors[strength.strength];
  const activeBars = colorConfig.bars;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= activeBars
                ? colorConfig.bg
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium transition-colors ${colorConfig.text}`}>
            {strength.feedback}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {password.length}/{128} chars
          </p>
        </div>
      )}
    </div>
  );
}
