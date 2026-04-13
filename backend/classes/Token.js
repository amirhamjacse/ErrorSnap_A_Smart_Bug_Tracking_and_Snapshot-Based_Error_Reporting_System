import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.PRIVATE_KEY || process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "error-snap-dev-secret";
  }

  throw new Error("Missing JWT secret. Set PRIVATE_KEY or JWT_SECRET in backend .env");
}

export default class Token {
  static create(value) {
    return jwt.sign(value, getJwtSecret());
  }

  static verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getJwtSecret(), (err, data) => {
        if (err) {
          resolve(false);
        } else {
          resolve(data);
        }
      });
    });
  }
}
