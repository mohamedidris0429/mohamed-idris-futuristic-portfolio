import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "../../../../../lib/require-owner";
import { getSupabase } from "../../../../../lib/supabase";

export const dynamic = "force-dynamic";

// OWNER ONLY: list every certificate (drafts included)
export async function GET(request: NextRequest) {
  const authError = await requireOwner(request);
  if (authError) return authError;

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("certificates")
      .select(
        "id, title, issuer, category, issue_date, credential_id, verification_url, description, mime_type, file_size, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin certificate fetch error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to fetch certificates" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        total: data?.length ?? 0,
        certificates: data ?? [],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
