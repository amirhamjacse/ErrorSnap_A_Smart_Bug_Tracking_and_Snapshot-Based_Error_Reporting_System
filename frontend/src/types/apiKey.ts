export type projectApiKey = {
  id: number;
  project_id: string;
  label: string;
  key_suffix: string;
  masked_key: string;
  rate_limit_per_minute: number;
  is_active: number;
  requests_in_window: number;
  window_started_at: string | null;
  last_used_at: string | null;
  created_at: string;
  api_key?: string;
};
