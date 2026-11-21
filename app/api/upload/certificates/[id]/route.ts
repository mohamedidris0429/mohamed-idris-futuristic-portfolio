import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "../../../../../lib/require-owner";
import { getSupabase } from "../../../../../lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const CATEGORY_PATTERN = /^[a-z0-9-]{2,32}$/;
const RESPONSE_FIELDS =
  "id, title, issuer, category, issue_date, credential_id, verification_url, description, mime_type, file_size, status, updated_at";

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireOwner(request);
  if (authError) return authError;

  try {
    const supabase = getSupabase();
    const { id } = await context.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate ID" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const optionalFields = [
      "credential_id",
      "verification_url",
      "description",
    ] as const;

    const requiredFields = ["title", "issuer", "category", "issue_date", "status"] as const;

    const updates: Record<string, string | null> = {};

    for (const field of requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(body, field)) continue;

      const value = body[field];

      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { success: false, message: `Invalid ${field}` },
          { status: 400 }
        );
      }

      updates[field] = field === "category" ? value.trim().toLowerCase() : value.trim();
    }

    for (const field of optionalFields) {
      if (!Object.prototype.hasOwnProperty.call(body, field)) continue;

      const value = body[field];

      updates[field] =
        typeof value === "string" && value.trim() ? value.trim() : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid updates provided" },
        { status: 400 }
      );
    }

    if (updates.status && !["draft", "published"].includes(updates.status)) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate status" },
        { status: 400 }
      );
    }

    if (updates.category && !CATEGORY_PATTERN.test(updates.category)) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate category" },
        { status: 400 }
      );
    }

    if (updates.verification_url) {
      try {
        const url = new URL(updates.verification_url);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid verification URL" },
          { status: 400 }
        );
      }
    }

    if (updates.issue_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.issue_date)) {
        return NextResponse.json(
          { success: false, message: "Invalid issue date" },
          { status: 400 }
        );
      }

      const date = new Date(`${updates.issue_date}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== updates.issue_date
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid issue date" },
          { status: 400 }
        );
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("certificates")
      .update(updates)
      .eq("id", id)
      .select(RESPONSE_FIELDS)
      .maybeSingle();

    if (error) {
      console.error("Certificate update error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to update certificate" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificate updated successfully",
      certificate: data,
    });
  } catch (error) {
    console.error("Certificate PATCH error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
