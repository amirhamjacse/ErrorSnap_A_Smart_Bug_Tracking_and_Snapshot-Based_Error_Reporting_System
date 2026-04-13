export const getTokenFromReq = (req) =>
  req.cookies.token || req.headers["authorization"]?.split(" ")[1];
