"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A Mermaid diagram, loaded on demand.
 *
 * Mermaid is ~500 kB. It is imported inside an effect rather than at module
 * scope so that the four routes which never open the C4 view do not pay for
 * it, and so the static export has nothing to run at build time.
 *
 * The theme is pinned to the design tokens. Mermaid ships its own palette —
 * purples, drop shadows and 8px corners — and left alone it would put a
 * second, louder design system on the page.
 */
let ready: Promise<typeof import("mermaid").default> | null = null;

function load() {
  if (!ready) {
    ready = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        fontFamily: "var(--font-inter), sans-serif",
        themeVariables: {
          background: "#FFFFFF",
          primaryColor: "#F8FAFC",
          primaryTextColor: "#0F172A",
          primaryBorderColor: "#818FA3",
          secondaryColor: "#FDF2F8",
          tertiaryColor: "#FFFFFF",
          lineColor: "#818FA3",
          textColor: "#0F172A",
          fontSize: "13px",
        },
        /* Mermaid rounds every node to 5px and draws a drop shadow on
           clusters. Both are off-token, and both fail silently rather than
           loudly, so they are overridden here rather than hunted later. */
        themeCSS: `
          .node rect, .node polygon, .cluster rect { rx: 4px; ry: 4px; filter: none; }
          .cluster rect { fill: #F8FAFC; stroke: #CBD5E1; }
          .edgeLabel { background-color: #FFFFFF; }
          .flowchart-link { stroke-width: 1.25px; }
        `,
        flowchart: { curve: "linear", htmlLabels: true, padding: 12 },
      });
      return mermaid;
    });
  }
  return ready;
}

let seq = 0;

export function MermaidDiagram({ chart, label }: { chart: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seq += 1;
    const id = `c4-${seq}`;

    load()
      .then((mermaid) => mermaid.render(id, chart))
      .then(({ svg }) => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = svg;
        // Mermaid emits a fixed width; the diagram has to survive a phone.
        const el = host.current.querySelector("svg");
        if (el) {
          el.removeAttribute("width");
          el.setAttribute("style", "max-width:100%;height:auto;display:block");
          el.setAttribute("role", "img");
          el.setAttribute("aria-label", label);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [chart, label]);

  if (error) {
    return (
      <pre className="overflow-x-auto border border-border bg-canvas p-4 type-console text-charcoal rounded-card">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={host}
      tabIndex={0}
      role="region"
      aria-label={label}
      className="overflow-x-auto border border-border bg-studio p-5 rounded-card shadow-card"
    />
  );
}
