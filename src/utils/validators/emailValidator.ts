import { normalizeEmail } from "./inputSanitizer";

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const domainPattern = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
const blockedDomainFragments = ["..", ".-", "-."];

export type EmailValidation = {
  normalized: string;
  isValid: boolean;
  message?: string;
};

export const validateEmail = (email: string): EmailValidation => {
  const normalized = normalizeEmail(email);
  const domain = normalized.split("@")[1] ?? "";

  if (!normalized) return { normalized, isValid: false, message: "Informe seu email." };
  if (!emailPattern.test(normalized)) return { normalized, isValid: false, message: "Email invalido." };
  if (!domainPattern.test(domain) || blockedDomainFragments.some((fragment) => domain.includes(fragment))) {
    return { normalized, isValid: false, message: "Dominio do email invalido." };
  }

  return { normalized, isValid: true };
};
