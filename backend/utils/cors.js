function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }

  const allowedOrigins = [process.env.FRONTEND_LINK, "http://127.0.0.1:3000"];
  const localDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):(3000|3001|5173|4173)$/;

  return allowedOrigins.includes(origin) || localDevOriginPattern.test(origin);
}

export function setCorsHeaders(req, res, next) {
  const origin = req.headers.origin;
  const publicPaths = ["/error-logs", "/upload"];
  const allowAnyOrigin = publicPaths.includes(req.path);
  const allowSpecificOrigin = isAllowedOrigin(origin);
  const corsOrigin = allowAnyOrigin ? "*" : allowSpecificOrigin ? origin : null;

  if (req.method === "OPTIONS") {
    if (corsOrigin) {
      res.setHeader("Access-Control-Allow-Origin", corsOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
      return res.status(204).end();
    } else {
      return res.status(403).end();
    }
  }

  if (corsOrigin) {
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
}
