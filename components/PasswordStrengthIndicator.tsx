"use client";

import {
  PASSWORD_RULES,
  getPasswordRuleResults,
} from "@/lib/passwordValidation";

export default function PasswordStrengthIndicator({
  password,
  variant = "dark",
}: {
  password: string;
  variant?: "dark" | "light";
}) {
  if (!password) return null;

  const results = getPasswordRuleResults(password);
  const light = variant === "light";

  return (
    <ul className="password-strength-indicator mt-2 grid gap-1 px-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = results[rule.key];
        return (
          <li
            key={rule.key}
            className={`flex min-w-0 items-center gap-2 text-xs leading-snug transition-colors ${
              passed
                ? light ? "text-emerald-600" : "text-emerald-400"
                : light ? "text-[#5A1E12]/40" : "text-white/40"
            }`}
          >
            {passed ? (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="min-w-0">{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
