export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const RULES: { test: (p: string) => boolean; message: string }[] = [
  {
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  },
  {
    test: (p) => p.length <= PASSWORD_MAX_LENGTH,
    message: `Password must be no more than ${PASSWORD_MAX_LENGTH} characters.`,
  },
  {
    test: (p) => /[A-Z]/.test(p),
    message: "Password must contain at least one uppercase letter.",
  },
  {
    test: (p) => /[a-z]/.test(p),
    message: "Password must contain at least one lowercase letter.",
  },
  {
    test: (p) => /[0-9]/.test(p),
    message: "Password must contain at least one number.",
  },
  {
    test: (p) => /[^A-Za-z0-9]/.test(p),
    message: "Password must contain at least one special character.",
  },
];

/**
 * Returns null when the password satisfies all strength rules,
 * or the first failing rule's error message.
 */
export function validatePassword(password: string): string | null {
  for (const rule of RULES) {
    if (!rule.test(password)) return rule.message;
  }
  return null;
}
