"use client";

import { useEffect, useRef, useState } from "react";

const SCENE_STYLES = `
<style>
  html, body { overflow-x: hidden; scrollbar-width: none; }
  ::-webkit-scrollbar { display: none; }
  body.is-locked { height: auto !important; overflow-y: auto !important; }
  .page, .nav, #pre, #fg-sky, #cursor, #rail { visibility: hidden !important; }
</style>
<script>
  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    var data = event.data;
    if (!data || data.type !== "portfolio-scene-sync") return;
    if (typeof data.scrollTop === "number") window.scrollTo(0, data.scrollTop);
    if (window.__kage && window.__kage.RIG) {
      if (typeof data.pointerX === "number") window.__kage.RIG.tmx = data.pointerX;
      if (typeof data.pointerY === "number") window.__kage.RIG.tmy = data.pointerY;
    }
  });
</script>`;

function prepareSceneDocument(html: string) {
  if (!html.includes('<canvas id="gl"') || !html.includes("function progressFor")) {
    throw new Error("The Kage source is missing its original canvas or scroll controller.");
  }

  const sceneOnlyHtml = html.replace(
    "initPost(); buildCards(); buildCardCloth();",
    "initPost();"
  );
  if (sceneOnlyHtml === html) {
    throw new Error("The Kage source's preview-only renderers could not be disabled.");
  }

  return sceneOnlyHtml
    .replace("<head>", '<head><base href="/landing-pages/">')
    .replace(
      /(["'])secret-pathways-assets\//g,
      "$1/landing-pages/secret-pathways-assets/"
    )
    .replace("</head>", `${SCENE_STYLES}</head>`);
}

export function Scene() {
  const [source, setSource] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const controller = new AbortController();

    fetch("/landing-pages/kage.html", {
      signal: controller.signal,
      cache: "force-cache",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Kage source request failed with status ${response.status}.`);
        }
        return response.text();
      })
      .then((html) => setSource(prepareSceneDocument(html)))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("[Kage scene] Could not load the original scene.", error);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!source) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const sync = () => {
      frame = 0;

      const childWindow = frameRef.current?.contentWindow;
      const childDocument = frameRef.current?.contentDocument;
      const childRoot = childDocument?.documentElement;
      if (!childWindow || !childRoot) return;

      const parentMax = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const childMax = Math.max(
        0,
        childRoot.scrollHeight - childWindow.innerHeight
      );
      const progress =
        parentMax > 0
          ? Math.min(1, Math.max(0, window.scrollY / parentMax))
          : 0;

      // srcDoc has an opaque origin; the receiver validates the sending window.
      childWindow.postMessage(
        {
          type: "portfolio-scene-sync",
          scrollTop: progress * childMax,
          pointerX,
          pointerY,
        },
        "*"
      );
    };

    const scheduleSync = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };

    const trackPointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
      scheduleSync();
    };

    syncRef.current = scheduleSync;
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("pointermove", trackPointer, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(document.documentElement);
    scheduleSync();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      syncRef.current = () => {};
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("pointermove", trackPointer);
    };
  }, [source]);

  return (
    <div className="scene" aria-hidden="true">
      {source ? (
        <iframe
          ref={frameRef}
          title="Kage original 3D scene"
          tabIndex={-1}
          srcDoc={source}
          onLoad={() => syncRef.current()}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
}
