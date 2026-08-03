export const MIN_PASSWORD_LENGTH = 8;

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordValidationError";
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePassword(password: string): void {
  if (!password) throw new PasswordValidationError("Password is required.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new PasswordValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

export function validatePasswordsMatch(password: string, confirmation: string): void {
  if (password !== confirmation) {
    throw new PasswordValidationError("Passwords don't match.");
  }
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
}

const STRENGTH_LABELS: PasswordStrength["label"][] = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

/**
 * Rough heuristic for the visual strength meter — UX feedback only, not a
 * security boundary. The real requirement enforced server-side is Appwrite's
 * own minimum (and `validatePassword` above, client-side, before submit).
 */
export function passwordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as PasswordStrength["score"];
  return { score: clamped, label: STRENGTH_LABELS[clamped] };
}