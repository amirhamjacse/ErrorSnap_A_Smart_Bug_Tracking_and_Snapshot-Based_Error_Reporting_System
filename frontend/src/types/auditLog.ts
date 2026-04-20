export type auditLog = {
  id: string;
  project_id: string;
  actor_id: number | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  metadata: Record<string, unknown> | string | null;
  created_at: string;
};
