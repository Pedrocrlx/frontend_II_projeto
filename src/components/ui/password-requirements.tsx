"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { getPasswordRequirements, type PasswordRequirement } from "@/lib/utils/passwordStrength";

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className = "" }: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = useMemo(() => {
    return getPasswordRequirements(password);
  }, [password]);

  // Don't show requirements if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
        Password requirements:
      </p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => {
          const isSpecialChar = requirement.label.includes("special character");
          const isRequired = !isSpecialChar;

          return (
            <li key={index} className="flex items-center gap-2 text-xs">
              {/* Icon */}
              <span
                className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
                  requirement.met
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                }`}
              >
                {requirement.met ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  <X className="w-3 h-3" strokeWidth={2} />
                )}
              </span>

              {/* Label */}
              <span
                className={`transition-colors ${
                  requirement.met
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-500 dark:text-slate-500"
                }`}
              >
                {requirement.label}
                {!isRequired && (
                  <span className="text-slate-400 dark:text-slate-600 ml-1 italic">
                    (optional)
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
