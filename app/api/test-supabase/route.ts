import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

/** Lightweight health check used after deployment to confirm the database and env are wired up. */
export async function GET() {
  try {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("certificates")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase health check error:", error);

      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Supabase database connected successfully" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Supabase health check error:", error);

    return NextResponse.json(
      { success: false, message: "Supabase environment variables are missing" },
      { status: 503 }
    );
  }
}
