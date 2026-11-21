import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./auth";

export const SESSION_COOKIE = "owner_session";

export async function isOwner(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) return false;

  return verifySessionToken(token);
}

/** Returns a 401 response when the caller is not the authenticated owner. */
export async function requireOwner(request: NextRequest) {
  const authenticated = await isOwner(request);

  if (!authenticated) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    return NextResponse.json(
      {
        success: false,
        message: token ? "Invalid or expired session" : "Unauthorized access",
      },
      { status: 401 }
    );
  }

  return null;
}
