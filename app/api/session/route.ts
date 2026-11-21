import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { success: true, authenticated: false },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const isValid = await verifySessionToken(token);

    if (!isValid) {
      const response = NextResponse.json(
        { success: true, authenticated: false },
        { headers: { "Cache-Control": "no-store" } }
      );

      response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json(
      { success: true, authenticated: true, role: "owner" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { success: false, authenticated: false, message: "Session verification failed" },
      { status: 500 }
    );
  }
}
