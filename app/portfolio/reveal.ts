"use client";

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (typeof window === "undefined") return null;
  if (observer) return observer;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  return observer;
}

/** Registers any not-yet-revealed `[data-reveal]` nodes inside `root`. */
export function refreshReveals(root: ParentNode = document) {
  if (typeof window === "undefined") return;

  const io = getObserver();
  const nodes = root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");

  nodes.forEach((node) => {
    if (io) {
      io.observe(node);
    } else {
      node.classList.add("is-in");
    }
  });
}
