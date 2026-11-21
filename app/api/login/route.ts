import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifyOwnerPassword,
} from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await verifyOwnerPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const token = await createSessionToken();

    const response = NextResponse.json(
      { success: true, message: "Owner login successful" },
      { headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to process login" },
      { status: 500 }
    );
  }
}
