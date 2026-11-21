import { NextRequest, NextResponse } from "next/server";
import { isOwner } from "../../../../../../lib/require-owner";
import { CERTIFICATE_BUCKET, getSupabase } from "../../../../../../lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Returns a short-lived signed URL for a certificate document.
 * Published certificates are public; drafts are only visible to the owner.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate ID" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const owner = await isOwner(request);

    let query = supabase
      .from("certificates")
      .select("storage_path, mime_type, status")
      .eq("id", id);

    if (!owner) {
      query = query.eq("status", "published");
    }

    const { data: certificate, error } = await query.maybeSingle();

    if (error) {
      console.error("Certificate lookup error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to find certificate" },
        { status: 500 }
      );
    }

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    const { data, error: storageError } = await supabase.storage
      .from(CERTIFICATE_BUCKET)
      .createSignedUrl(certificate.storage_path, 60);

    if (storageError || !data?.signedUrl) {
      console.error("Signed URL error:", storageError);

      return NextResponse.json(
        { success: false, message: "Unable to access certificate file" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        fileUrl: data.signedUrl,
        mimeType: certificate.mime_type,
        expiresIn: 60,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Certificate file API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
