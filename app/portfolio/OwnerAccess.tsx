"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, type Certificate } from "./api";
import { categoryLabels } from "./content";
import { useDialog } from "./useModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

type Tab = "overview" | "manage" | "upload";

const CATEGORY_OPTIONS = ["ece", "web", "iot", "academic"];

const emptyDraft = {
  title: "",
  issuer: "",
  category: "ece",
  issue_date: "",
  credential_id: "",
  verification_url: "",
  description: "",
  status: "draft" as "draft" | "published",
};

export function OwnerAccess({ open, onClose, onChanged }: Props) {
  const [checking, setChecking] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [listState, setListState] = useState<"idle" | "loading" | "error">("idle");
  const [listMessage, setListMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [editDraft, setEditDraft] = useState(emptyDraft);

  const close = useCallback(() => {
    setPassword("");
    setAuthError("");
    setNotice("");
    setEditing(null);
    onClose();
  }, [onClose]);

  useDialog(open, close);

  const loadCertificates = useCallback(async () => {
    setListState("loading");
    setListMessage("");

    try {
      const result = await api<{ certificates: Certificate[] }>(
        "/api/upload/certificates/admin"
      );
      setCertificates(result.certificates ?? []);
      setListState("idle");
    } catch (error) {
      setListState("error");
      setListMessage(
        error instanceof Error ? error.message : "Unable to load certificates"
      );
    }
  }, []);

  // Verify the existing owner session whenever the overlay opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const check = async () => {
      setChecking(true);
      try {
        const session = await api<{ authenticated: boolean }>("/api/session");
        if (cancelled) return;
        setAuthenticated(session.authenticated);
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open && authenticated) loadCertificates();
  }, [open, authenticated, loadCertificates]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setAuthError("");

    try {
      await api("/api/login", { method: "POST", json: { password } });
      setAuthenticated(true);
      setPassword("");
      setTab("overview");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Access denied");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await api("/api/logout", { method: "POST" });
    } catch {
      // A failed logout still clears the local view; the cookie expires on its own.
    } finally {
      setAuthenticated(false);
      setCertificates([]);
      setBusy(false);
      onChanged();
    }
  };

  const published = certificates.filter((item) => item.status === "published").length;
  const drafts = certificates.length - published;

  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const body = new FormData();
      body.set("title", draft.title);
      body.set("issuer", draft.issuer);
      body.set("category", draft.category);
      body.set("issue_date", draft.issue_date);
      body.set("credential_id", draft.credential_id);
      body.set("verification_url", draft.verification_url);
      body.set("description", draft.description);
      body.set("status", draft.status);
      if (file) body.set("file", file);

      await api("/api/upload/certificates", { method: "POST", body });

      setDraft(emptyDraft);
      setFile(null);
      setNotice("Certificate uploaded successfully.");
      await loadCertificates();
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (certificate: Certificate) => {
    setBusy(true);
    setNotice("");

    try {
      await api(`/api/upload/certificates/${encodeURIComponent(certificate.id)}`, {
        method: "PATCH",
        json: {
          title: certificate.title,
          issuer: certificate.issuer,
          category: certificate.category,
          issue_date: certificate.issue_date,
          status: certificate.status === "published" ? "draft" : "published",
        },
      });

      await loadCertificates();
      onChanged();
      setNotice("Visibility updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (certificate: Certificate) => {
    if (!window.confirm(`Permanently delete "${certificate.title}"?`)) return;

    setBusy(true);
    setNotice("");

    try {
      await api(`/api/upload/certificates?id=${encodeURIComponent(certificate.id)}`, {
        method: "DELETE",
      });

      await loadCertificates();
      onChanged();
      setNotice("Certificate deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (certificate: Certificate) => {
    setEditing(certificate);
    setEditDraft({
      title: certificate.title,
      issuer: certificate.issuer,
      category: certificate.category,
      issue_date: certificate.issue_date,
      credential_id: certificate.credential_id ?? "",
      verification_url: certificate.verification_url ?? "",
      description: certificate.description ?? "",
      status: certificate.status,
    });
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    setBusy(true);
    setNotice("");

    try {
      await api(`/api/upload/certificates/${encodeURIComponent(editing.id)}`, {
        method: "PATCH",
        json: editDraft,
      });

      setEditing(null);
      await loadCertificates();
      onChanged();
      setNotice("Changes saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal" role="presentation" onClick={close}>
      {!authenticated ? (
        <div
          className="modal__panel modal__panel--auth"
          role="dialog"
          aria-modal="true"
          aria-labelledby="owner-auth-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="modal__head">
            <div>
              <p className="eyebrow eyebrow--tight">
                <span>RESTRICTED // SESSION MAX 2H</span>
              </p>
              <h3 className="modal__title" id="owner-auth-title">
                Owner access portal
              </h3>
            </div>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close">
              ✕
            </button>
          </header>

          <form className="form" onSubmit={login}>
            <label className="field">
              <span className="field__label">Owner passkey</span>
              <span className="field__control">
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide passkey" : "Show passkey"}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </span>
            </label>

            {authError ? (
              <p className="state state--error" role="status">
                {authError}
              </p>
            ) : null}

            <div className="form__actions">
              <button type="submit" className="btn" disabled={busy || checking}>
                {checking ? "Checking session…" : busy ? "Authenticating…" : "Authenticate"}
              </button>
              <button type="button" className="btn btn--ghost" onClick={close}>
                Cancel
              </button>
            </div>
            <p className="hint">
              Public visitors keep read-only access. Uploading, editing, publishing
              and deleting require an authenticated owner session.
            </p>
          </form>
        </div>
      ) : (
        <div
          className="dashboard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="owner-dash-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="dashboard__head">
            <div>
              <p className="eyebrow eyebrow--tight">
                <span>OWNER DASHBOARD // VERIFIED SESSION</span>
                <span className="badge badge--live">SESSION SECURE</span>
              </p>
              <h3 className="dashboard__title" id="owner-dash-title">
                Owner control center
              </h3>
              <p className="dashboard__sub">
                Root admin: P. Mohamed Idris // ID: SINC-0429
              </p>
            </div>
            <div className="dashboard__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={loadCertificates}
                disabled={busy}
              >
                Refresh
              </button>
              <button type="button" className="btn btn--sm" onClick={logout} disabled={busy}>
                Logout
              </button>
              <button type="button" className="icon-btn" onClick={close} aria-label="Close dashboard">
                ✕
              </button>
            </div>
          </header>

          <nav className="tabs" aria-label="Dashboard sections">
            {(
              [
                ["overview", "Overview"],
                ["manage", "Manage credentials"],
                ["upload", "Upload certificate"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`tab${tab === id ? " is-active" : ""}`}
                aria-selected={tab === id}
                role="tab"
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {notice ? (
            <p className="state state--notice" role="status">
              {notice}
            </p>
          ) : null}

          {tab === "overview" ? (
            <div className="dashboard__body">
              <div className="stats">
                <div className="stat">
                  <span className="stat__value">{certificates.length}</span>
                  <span className="stat__label">Total credentials</span>
                  <span className="stat__meta">ALL TRACKS</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{published}</span>
                  <span className="stat__label">Published</span>
                  <span className="stat__meta">LIVE ON PORTFOLIO</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{drafts}</span>
                  <span className="stat__label">Drafts</span>
                  <span className="stat__meta">OWNER ONLY</span>
                </div>
                <div className="stat">
                  <span className="stat__value">OK</span>
                  <span className="stat__label">Registry status</span>
                  <span className="stat__meta">SYNC ACTIVE</span>
                </div>
              </div>

              <ul className="checklist">
                <li>Owner session verified from the server cookie</li>
                <li>Certificate metadata stored in Supabase Postgres</li>
                <li>Documents stored in the private &quot;certificates&quot; bucket</li>
                <li>Public visitors receive published records only</li>
              </ul>

              <div className="form__actions">
                <button type="button" className="btn" onClick={() => setTab("manage")}>
                  Manage credentials
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setTab("upload")}
                >
                  Upload a certificate
                </button>
              </div>
            </div>
          ) : null}

          {tab === "manage" ? (
            <div className="dashboard__body">
              <div className="listhead">
                <p className="hint">
                  Edit metadata, publish or unpublish, or permanently delete a credential.
                </p>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={loadCertificates}
                  disabled={busy}
                >
                  Reload from server
                </button>
              </div>

              {listState === "loading" ? <p className="state">Loading certificates…</p> : null}
              {listState === "error" ? (
                <p className="state state--error">{listMessage}</p>
              ) : null}
              {listState === "idle" && certificates.length === 0 ? (
                <p className="state">No certificates stored yet.</p>
              ) : null}

              <ul className="records">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="record">
                    <div className="record__main">
                      <p className="record__meta">
                        <span>{categoryLabels[certificate.category] ?? certificate.category}</span>
                        <span>{formatDate(certificate.issue_date)}</span>
                        <span
                          className={`badge ${
                            certificate.status === "published" ? "badge--live" : "badge--draft"
                          }`}
                        >
                          {certificate.status}
                        </span>
                      </p>
                      <h4 className="record__title">{certificate.title}</h4>
                      <p className="record__issuer">{certificate.issuer}</p>
                    </div>
                    <div className="record__actions">
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => startEdit(certificate)}
                        disabled={busy}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        onClick={() => toggleStatus(certificate)}
                        disabled={busy}
                      >
                        {certificate.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => remove(certificate)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "upload" ? (
            <div className="dashboard__body">
              <form className="form" onSubmit={submitUpload}>
                <div className="form__grid">
                  <label className="field">
                    <span className="field__label">Certificate title *</span>
                    <input
                      className="input"
                      value={draft.title}
                      onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Issuing organization *</span>
                    <input
                      className="input"
                      value={draft.issuer}
                      onChange={(event) => setDraft({ ...draft, issuer: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Category track *</span>
                    <select
                      className="input"
                      value={draft.category}
                      onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabels[category]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Issue date *</span>
                    <input
                      className="input"
                      type="date"
                      value={draft.issue_date}
                      onChange={(event) => setDraft({ ...draft, issue_date: event.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Credential ID</span>
                    <input
                      className="input"
                      value={draft.credential_id}
                      onChange={(event) =>
                        setDraft({ ...draft, credential_id: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Verification URL</span>
                    <input
                      className="input"
                      type="url"
                      placeholder="https://"
                      value={draft.verification_url}
                      onChange={(event) =>
                        setDraft({ ...draft, verification_url: event.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="field">
                  <span className="field__label">Description</span>
                  <textarea
                    className="input input--area"
                    rows={3}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft({ ...draft, description: event.target.value })
                    }
                  />
                </label>

                <div className="form__grid">
                  <label className="field">
                    <span className="field__label">Visibility</span>
                    <select
                      className="input"
                      value={draft.status}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          status: event.target.value as "draft" | "published",
                        })
                      }
                    >
                      <option value="draft">Save as draft (owner only)</option>
                      <option value="published">Publish immediately</option>
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">
                      Certificate file * (PDF, JPG, PNG, WebP · max 25 MB)
                    </span>
                    <input
                      className="input input--file"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      required
                    />
                  </label>
                </div>

                <p className="hint">
                  Stored privately in Supabase Storage and served through short-lived
                  signed URLs. Public visitors maintain read-only access.
                </p>

                <div className="form__actions">
                  <button type="submit" className="btn" disabled={busy}>
                    {busy ? "Uploading…" : "Upload certificate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setDraft(emptyDraft);
                      setFile(null);
                    }}
                    disabled={busy}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      )}

      {editing ? (
        <div
          className="modal modal--stacked"
          role="presentation"
          onClick={(event) => {
            event.stopPropagation();
            setEditing(null);
          }}
        >
          <div
            className="modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal__head">
              <div>
                <p className="eyebrow eyebrow--tight">
                  <span>EDIT CREDENTIAL</span>
                </p>
                <h3 className="modal__title" id="edit-title">
                  {editing.title}
                </h3>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditing(null)}
                aria-label="Close edit form"
              >
                ✕
              </button>
            </header>

            <form className="form" onSubmit={saveEdit}>
              <div className="form__grid">
                <label className="field">
                  <span className="field__label">Certificate title *</span>
                  <input
                    className="input"
                    value={editDraft.title}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, title: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Issuer *</span>
                  <input
                    className="input"
                    value={editDraft.issuer}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, issuer: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Category *</span>
                  <select
                    className="input"
                    value={editDraft.category}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, category: event.target.value })
                    }
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Issue date *</span>
                  <input
                    className="input"
                    type="date"
                    value={editDraft.issue_date}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, issue_date: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Credential ID</span>
                  <input
                    className="input"
                    value={editDraft.credential_id}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, credential_id: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span className="field__label">Verification URL</span>
                  <input
                    className="input"
                    type="url"
                    value={editDraft.verification_url}
                    onChange={(event) =>
                      setEditDraft({ ...editDraft, verification_url: event.target.value })
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Description</span>
                <textarea
                  className="input input--area"
                  rows={3}
                  value={editDraft.description}
                  onChange={(event) =>
                    setEditDraft({ ...editDraft, description: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span className="field__label">Visibility</span>
                <select
                  className="input"
                  value={editDraft.status}
                  onChange={(event) =>
                    setEditDraft({
                      ...editDraft,
                      status: event.target.value as "draft" | "published",
                    })
                  }
                >
                  <option value="published">Published (visible to visitors)</option>
                  <option value="draft">Draft (owner only)</option>
                </select>
              </label>

              <div className="form__actions">
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
