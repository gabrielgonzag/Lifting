import { auditRepository, type AuditEventType, type AuditSeverity } from "../repositories/auditRepository";

const sensitiveKeys = new Set(["access_token", "password", "refresh_token", "secret", "token"]);

const sanitizeMetadata = (metadata: Record<string, unknown> = {}) =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !sensitiveKeys.has(key.toLowerCase()))
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.slice(0, 240) : typeof value === "number" || typeof value === "boolean" ? value : String(value).slice(0, 240),
      ]),
  );

export const auditService = {
  async record({
    eventType,
    metadata,
    severity,
    userId,
  }: {
    eventType: AuditEventType;
    metadata?: Record<string, unknown>;
    severity: AuditSeverity;
    userId?: string;
  }) {
    try {
      await auditRepository.create({
        eventType,
        metadata: sanitizeMetadata(metadata),
        severity,
        userId,
      });
    } catch {
      // Auditing must never expose sensitive errors or block the user flow.
    }
  },
};
