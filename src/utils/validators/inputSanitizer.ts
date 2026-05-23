export const sanitizeText = (value: string) =>
  value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
