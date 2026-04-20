const ALLOWED_ENVIRONMENTS = ["development", "staging", "production"];

export function normalizeEnvironment(value, fallback = "production") {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (!ALLOWED_ENVIRONMENTS.includes(normalized)) {
    return fallback;
  }

  return normalized;
}

export function getAllowedEnvironments() {
  return [...ALLOWED_ENVIRONMENTS];
}
