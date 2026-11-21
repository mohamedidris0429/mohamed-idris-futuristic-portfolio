import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "owner_session";
export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60;

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }

  return new TextEncoder().encode(secret);
};

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Reads the owner credential.
 *
 * Next.js expands `$NAME` references inside .env files, which corrupts bcrypt
 * hashes (`$2b$12$...`) unless every `$` is escaped as `\$`. We therefore accept
 * escaped hashes, a base64 encoded hash (immune to expansion) and, for local
 * development only, a plaintext password.
 */
function getOwnerPasswordHash(): string | null {
  const encoded = process.env.OWNER_PASSWORD_HASH_B64;

  if (encoded) {
    const decoded = Buffer.from(encoded, "base64").toString("utf8").trim();

    if (BCRYPT_HASH.test(decoded)) return decoded;

    throw new Error("OWNER_PASSWORD_HASH_B64 is not a base64 encoded bcrypt hash");
  }

  const raw = process.env.OWNER_PASSWORD_HASH;

  if (!raw) return null;

  const unescaped = raw.trim().replace(/\\\$/g, "$");

  if (!BCRYPT_HASH.test(unescaped)) {
    throw new Error(
      "OWNER_PASSWORD_HASH is not a valid bcrypt hash. Escape every `$` as `\\$` in .env files, or use OWNER_PASSWORD_HASH_B64."
    );
  }

  return unescaped;
}

export async function verifyOwnerPassword(password: string) {
  const passwordHash = getOwnerPasswordHash();
  const plainPassword = process.env.OWNER_PASSWORD;

  if (passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  if (plainPassword) {
    return password === plainPassword;
  }

  throw new Error(
    "No owner credential configured: set OWNER_PASSWORD_HASH (or OWNER_PASSWORD_HASH_B64)"
  );
}

export async function createSessionToken() {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    return payload.role === "owner";
  } catch {
    return false;
  }
}
