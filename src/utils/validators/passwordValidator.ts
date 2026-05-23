const specialPattern = /[!@#$%&*_-]/;

export type PasswordValidation = {
  isValid: boolean;
  strength: "fraca" | "media" | "forte";
  score: number;
  checks: {
    minLength: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  messages: string[];
};

export const validatePassword = (password: string): PasswordValidation => {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: specialPattern.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const isValid = checks.minLength && checks.uppercase && checks.number;
  const strength = isValid && checks.special ? "forte" : isValid ? "media" : "fraca";
  const messages = [
    checks.minLength ? "" : "Use no minimo 8 caracteres.",
    checks.uppercase ? "" : "Inclua pelo menos 1 letra maiuscula.",
    checks.number ? "" : "Inclua pelo menos 1 numero.",
  ].filter(Boolean);

  return { isValid, strength, score, checks, messages };
};
