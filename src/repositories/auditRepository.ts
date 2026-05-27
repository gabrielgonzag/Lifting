import { databaseClient, supabase } from "../services/databaseClient";

export type AuditSeverity = "critical" | "info" | "warning";

export type AuditEventType =
  | "access_denied"
  | "account_suspended"
  | "achievement_unlocked"
  | "admin_action"
  | "gamification_update"
  | "login_failed"
  | "login_success"
  | "logout"
  | "password_reset_requested"
  | "plan_change_attempt"
  | "profile_updated"
  | "role_change_attempt"
  | "signup"
  | "suspicious_activity"
  | "title_unlocked"
  | "unauthorized_action"
  | "workout_deleted";

export type AuditLogInput = {
  eventType: AuditEventType;
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
  userId?: string;
};

type AuditLog = AuditLogInput & {
  createdAt: string;
  id: string;
};

export const auditRepository = {
  async create(input: AuditLogInput) {
    if (supabase) {
      await supabase.from("security_audit_logs").insert({
        event_type: input.eventType,
        metadata: input.metadata ?? {},
        severity: input.severity,
        user_id: input.userId ?? null,
      });
      return;
    }

    const logs = databaseClient.read<AuditLog[]>("security_audit_logs", []);
    databaseClient.write("security_audit_logs", [
      {
        ...input,
        createdAt: new Date().toISOString(),
        id: `audit_${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        metadata: input.metadata ?? {},
      },
      ...logs.slice(0, 199),
    ]);
  },
};
