export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  category: string;
  issue_date: string;
  credential_id: string | null;
  verification_url: string | null;
  description: string | null;
  mime_type: string;
  status: "published" | "draft";
  created_at?: string;
  updated_at?: string;
  file_size?: number | null;
};

type ApiOptions = RequestInit & { json?: unknown };

/** Thin fetch wrapper that keeps the owner session cookie and normalises API errors. */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const response = await fetch(path, {
    credentials: "same-origin",
    cache: "no-store",
    ...rest,
    ...(json !== undefined
      ? {
          headers: { "Content-Type": "application/json", ...(headers ?? {}) },
          body: JSON.stringify(json),
        }
      : { headers }),
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { success?: boolean; message?: string })
    | null;

  if (!response.ok || !data || data.success === false) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data as T;
}

export function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
