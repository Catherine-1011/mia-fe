export const PASSWORD_RULES = [
  { key: "minLength", label: "At least 8 characters", errorMessage: "Password must be at least 8 characters.", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "Contains uppercase letter", errorMessage: "Password must contain at least one uppercase letter.", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "Contains lowercase letter", errorMessage: "Password must contain at least one lowercase letter.", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "Contains a number", errorMessage: "Password must contain at least one number.", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "Contains special character", errorMessage: "Password must contain at least one special character.", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export type PasswordRuleKey = (typeof PASSWORD_RULES)[number]["key"];

export function getPasswordRuleResults(password: string): Record<PasswordRuleKey, boolean> {
  return Object.fromEntries(
    PASSWORD_RULES.map((r) => [r.key, r.test(password)])
  ) as Record<PasswordRuleKey, boolean>;
}

export function isValidSignupPassword(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}

export function getFirstPasswordError(password: string): string | null {
  const failing = PASSWORD_RULES.find((r) => !r.test(password));
  return failing ? failing.errorMessage : null;
}
