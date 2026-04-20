export const environmentOptions = [
  { label: "All", value: "" },
  { label: "Development", value: "development" },
  { label: "Staging", value: "staging" },
  { label: "Production", value: "production" },
] as const;

export const environmentColorMap: Record<string, "default" | "info" | "warning" | "success"> = {
  development: "info",
  staging: "warning",
  production: "success",
};

export function normalizeEnvironmentLabel(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return "Unknown";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
