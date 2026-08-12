"use client";

import { C } from "@/lib/investment-copilot/constants";

/* ------------------------------------------------------------------ */
/*  DUMMY QUESTION BAR — fixed, static set, small footprint            */
/*  These are the same starter questions every time, pinned just above */
/*  the input box. They never change based on conversation state.      */
/* ------------------------------------------------------------------ */
export default function ChipRow({ items, onClick, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-1.5">
      <div className="text-[9px] uppercase tracking-wider font-mono mb-1" style={{ color: C.faint }}>
        {label || "Suggested"}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <button key={i} onClick={() => onClick(it)}
            className="text-[11px] leading-tight px-2 py-1 rounded-md border transition-all duration-150"
            style={{ borderColor: C.line, color: C.muted, background: C.panel, maxWidth: 300 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.muted; }}>
            {it.label || it.q}
          </button>
        ))}
      </div>
    </div>
  );
}
