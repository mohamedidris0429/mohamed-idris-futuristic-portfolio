"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, type Certificate } from "./api";
import { certificateCategories, categoryLabels } from "./content";
import { refreshReveals } from "./reveal";
import { useDialog } from "./useModal";

type Props = {
  refreshKey: number;
  onOwnerAccess: () => void;
};

type LoadState = "loading" | "ready" | "error";

export function Certifications({ refreshKey, onOwnerAccess }: Props) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const [viewer, setViewer] = useState<Certificate | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileState, setFileState] = useState<"idle" | "loading" | "error">("idle");
  const [fileMessage, setFileMessage] = useState("");

  const closeViewer = useCallback(() => {
    setViewer(null);
    setFileUrl("");
    setFileState("idle");
    setFileMessage("");
  }, []);

  useDialog(Boolean(viewer), closeViewer);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState("loading");
      setMessage("");

      try {
        const result = await api<{ certificates: Certificate[] }>(
          "/api/upload/certificates"
        );

        if (cancelled) return;
        setCertificates(result.certificates ?? []);
        setState("ready");
      } catch (error) {
        if (cancelled) return;
        setState("error");
        setMessage(
          error instanceof Error ? error.message : "Unable to load credentials"
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    refreshReveals();
  }, [certificates, filter]);

  const openDocument = async (certificate: Certificate) => {
    setViewer(certificate);
    setFileUrl("");
    setFileState("loading");
    setFileMessage("");

    try {
      const result = await api<{ fileUrl: string }>(
        `/api/upload/certificates/${encodeURIComponent(certificate.id)}/file`
      );

      setFileUrl(result.fileUrl);
      setFileState("idle");
    } catch (error) {
      setFileState("error");
      setFileMessage(
        error instanceof Error ? error.message : "Unable to open the document"
      );
    }
  };

  const visible =
    filter === "all"
      ? certificates
      : certificates.filter((certificate) => certificate.category === filter);

  return (
    <section className="section section--cert" id="certifications">
      <div className="shell">
        <header className="section__head" data-reveal>
          <p className="eyebrow">
            <span>06 // CREDENTIALS</span>
            <span className="eyebrow__meta">HASH_SHA256: SECURE</span>
          </p>
          <div className="section__headrow">
            <h2 className="section__title">
              Certifications &amp; verified honors
            </h2>
            <button type="button" className="btn btn--ghost btn--sm" onClick={onOwnerAccess}>
              <span className="dot" aria-hidden="true" />
              Owner portal
            </button>
          </div>
          <p className="section__lead">
            Verified technical proficiencies, specialised coursework and
            recognitions. Each document is stored privately and served through a
            short-lived signed URL.
          </p>
        </header>

        <div className="filters" role="tablist" aria-label="Certificate categories" data-reveal>
          {certificateCategories.map((category) => {
            const count =
              category.id === "all"
                ? certificates.length
                : certificates.filter((item) => item.category === category.id).length;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={filter === category.id}
                className={`filter${filter === category.id ? " is-active" : ""}`}
                onClick={() => setFilter(category.id)}
              >
                {category.label}
                <span className="filter__count">{count}</span>
              </button>
            );
          })}
        </div>

        {state === "loading" ? (
          <p className="state" data-reveal>
            <span className="state__pulse" aria-hidden="true" />
            Loading verified credentials…
          </p>
        ) : null}

        {state === "error" ? (
          <p className="state state--error" role="status" data-reveal>
            The certificate registry is unavailable right now. {message}
          </p>
        ) : null}

        {state === "ready" && visible.length === 0 ? (
          <p className="state" data-reveal>
            No credentials in this track yet.
          </p>
        ) : null}

        <div className="cert-grid">
          {visible.map((certificate, index) => (
            <article
              key={certificate.id}
              className="cert"
              data-reveal
              style={{ ["--d" as string]: `${index * 60}ms` }}
            >
              <p className="cert__top">
                <span className="cert__cat">
                  {categoryLabels[certificate.category] ?? certificate.category}
                </span>
                <span className="cert__date">{formatDate(certificate.issue_date)}</span>
              </p>
              <h3 className="cert__title">{certificate.title}</h3>
              <p className="cert__issuer">{certificate.issuer}</p>
              {certificate.description ? (
                <p className="cert__desc">{certificate.description}</p>
              ) : null}
              {certificate.credential_id ? (
                <p className="cert__id">
                  <span>ID</span> {certificate.credential_id}
                </p>
              ) : null}
              <div className="cert__actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => openDocument(certificate)}
                >
                  Open document
                </button>
                {certificate.verification_url ? (
                  <a
                    className="link"
                    href={certificate.verification_url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Verify source <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>

      {viewer ? (
        <div className="modal" role="presentation" onClick={closeViewer}>
          <div
            className="modal__panel modal__panel--viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`Certificate: ${viewer.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal__head">
              <div>
                <p className="eyebrow eyebrow--tight">
                  <span>{categoryLabels[viewer.category] ?? viewer.category}</span>
                </p>
                <h3 className="modal__title">{viewer.title}</h3>
                <p className="modal__sub">
                  {viewer.issuer} • Issued {formatDate(viewer.issue_date)}
                </p>
              </div>
              <button type="button" className="icon-btn" onClick={closeViewer} aria-label="Close">
                ✕
              </button>
            </header>

            <div className="modal__body">
              {fileState === "loading" ? (
                <p className="state">Requesting a secure document link…</p>
              ) : null}

              {fileState === "error" ? (
                <p className="state state--error" role="status">
                  {fileMessage}
                </p>
              ) : null}

              {fileUrl ? (
                <div className="viewer">
                  {viewer.mime_type === "application/pdf" ? (
                    <iframe
                      className="viewer__frame"
                      src={fileUrl}
                      title={`${viewer.title} document`}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="viewer__image"
                      src={fileUrl}
                      alt={`${viewer.title} certificate document`}
                    />
                  )}
                  <div className="viewer__actions">
                    <a className="btn btn--small" href={fileUrl} target="_blank" rel="noreferrer noopener">
                      Open in new tab
                    </a>
                    <a className="btn btn--ghost btn--small" href={fileUrl} download>
                      Download
                    </a>
                  </div>
                </div>
              ) : null}

              {viewer.description ? <p className="viewer__desc">{viewer.description}</p> : null}

              {viewer.credential_id ? (
                <p className="viewer__meta">
                  <span>Credential ID</span> {viewer.credential_id}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
