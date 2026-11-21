import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "../../../../lib/require-owner";
import { CERTIFICATE_BUCKET, getSupabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const PUBLIC_FIELDS =
  "id, title, issuer, category, issue_date, credential_id, verification_url, description, mime_type, status, created_at";

const CATEGORY_PATTERN = /^[a-z0-9-]{2,32}$/;

// PUBLIC: Get published certificates
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("certificates")
      .select(PUBLIC_FIELDS)
      .eq("status", "published")
      .order("issue_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Certificate fetch error:", error);

      return NextResponse.json(
        { success: false, message: "Unable to fetch certificates" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, certificates: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Certificate GET error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// OWNER ONLY: Upload a certificate
export async function POST(request: NextRequest) {
  const authError = await requireOwner(request);
  if (authError) return authError;

  let uploadedPath: string | null = null;

  try {
    const supabase = getSupabase();
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const issuer = String(formData.get("issuer") || "").trim();
    const category = String(formData.get("category") || "").trim().toLowerCase();
    const issueDate = String(formData.get("issue_date") || "").trim();
    const credentialId = String(formData.get("credential_id") || "").trim();
    const verificationUrl = String(formData.get("verification_url") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const status = String(formData.get("status") || "draft");
    const file = formData.get("file");

    if (!title || !issuer || !category || !issueDate) {
      return NextResponse.json(
        { success: false, message: "Title, issuer, category and issue date are required" },
        { status: 400 }
      );
    }

    if (!CATEGORY_PATTERN.test(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate category" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      return NextResponse.json(
        { success: false, message: "Invalid issue date" },
        { status: 400 }
      );
    }

    const date = new Date(`${issueDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== issueDate
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid issue date" },
        { status: 400 }
      );
    }

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate status" },
        { status: 400 }
      );
    }

    if (verificationUrl) {
      try {
        const url = new URL(verificationUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL protocol");
        }
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid verification URL" },
          { status: 400 }
        );
      }
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "Please select a valid certificate file" },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { success: false, message: "Only PDF, JPG, PNG and WebP files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File exceeds the 25 MB limit" },
        { status: 400 }
      );
    }

    const storagePath = `${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(CERTIFICATE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      return NextResponse.json(
        { success: false, message: "File upload failed" },
        { status: 500 }
      );
    }

    uploadedPath = storagePath;

    const { data, error: databaseError } = await supabase
      .from("certificates")
      .insert({
        title,
        issuer,
        category,
        issue_date: issueDate,
        credential_id: credentialId || null,
        verification_url: verificationUrl || null,
        description: description || null,
        storage_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        status,
      })
      .select(PUBLIC_FIELDS)
      .single();

    if (databaseError) {
      console.error("Certificate database error:", databaseError);

      await supabase.storage.from(CERTIFICATE_BUCKET).remove([storagePath]);
      uploadedPath = null;

      return NextResponse.json(
        { success: false, message: "Unable to save certificate details" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Certificate uploaded successfully",
        certificate: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Certificate upload error:", error);

    if (uploadedPath) {
      try {
        await getSupabase().storage.from(CERTIFICATE_BUCKET).remove([uploadedPath]);
      } catch (cleanupError) {
        console.error("Storage cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// OWNER ONLY: Delete a certificate
export async function DELETE(request: NextRequest) {
  const authError = await requireOwner(request);
  if (authError) return authError;

  try {
    const supabase = getSupabase();
    const id = request.nextUrl.searchParams.get("id");

    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid certificate ID" },
        { status: 400 }
      );
    }

    const { data: certificate, error: fetchError } = await supabase
      .from("certificates")
      .select("id, storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !certificate) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Certificate delete error:", deleteError);

      return NextResponse.json(
        { success: false, message: "Unable to delete certificate" },
        { status: 500 }
      );
    }

    const { error: storageError } = await supabase.storage
      .from(CERTIFICATE_BUCKET)
      .remove([certificate.storage_path]);

    if (storageError) {
      console.error("Storage cleanup required:", storageError);
    }

    return NextResponse.json({
      success: true,
      message: storageError
        ? "Certificate record deleted; storage cleanup is pending"
        : "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Certificate DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
