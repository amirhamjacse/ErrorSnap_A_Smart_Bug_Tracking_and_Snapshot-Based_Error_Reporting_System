export type billingPricing = {
  currency: string;
  errors_per_1000: number;
  sessions_per_1000: number;
  api_calls_per_10000: number;
};

export type billingEstimate = {
  errors: number;
  sessions: number;
  api_calls: number;
  total: number;
};

export type billingUsage = {
  errors_logged: number;
  sessions_recorded: number;
  api_calls: number;
};

export type billingSummary = {
  project_id: string;
  period_key: string;
  usage: billingUsage;
  pricing: billingPricing;
  estimate: billingEstimate;
};

export type billingHistoryItem = billingSummary & {
  created_at: string;
  updated_at: string;
};
