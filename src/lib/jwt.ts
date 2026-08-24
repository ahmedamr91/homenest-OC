import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is not set. Refusing to sign/verify sessions with an insecure fallback."
      );
    }
    // Local dev fallback only — never used in production.
    return new TextEncoder().encode("insecure-dev-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email || ""),
      name: String(payload.name || ""),
    };
  } catch {
    return null;
  }
}
