"use client";

import { C } from "@/lib/investment-copilot/constants";
import { Send } from "@/components/investment-copilot/icons";

/* ------------------------------------------------------------------ */
/*  INLINE FOLLOW-UPS — rendered directly under a specific response,   */
/*  not pinned to the footer. One optional CTA (e.g. "Submit for       */
/*  manager review") is visually distinguished but stays light, never  */
/*  the dark/ink treatment used for primary nav actions.               */
/* ------------------------------------------------------------------ */
export default function InlineFollowUps({ items, onClick, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-2">
      {label && (
        <div className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: C.faint }}>
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => {
          const isCta = it.action === "submit";
          return (
            <button
              key={i}
              onClick={() => onClick(it)}
              className="text-[12.5px] leading-tight px-3 py-1.5 rounded-md border transition-all duration-150 flex items-center gap-1.5"
              style={
                isCta
                  ? { borderColor: C.teal, color: C.teal, background: C.tealDim, fontWeight: 500 }
                  : { borderColor: C.line, color: C.text, background: C.panel, maxWidth: 340 }
              }
              onMouseEnter={(e) => {
                if (isCta) { e.currentTarget.style.background = C.teal; e.currentTarget.style.color = "#FAF9F5"; }
                else { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.borderColor = C.teal; }
              }}
              onMouseLeave={(e) => {
                if (isCta) { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.color = C.teal; }
                else { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.line; }
              }}
            >
              {isCta && <Send size={11} />}
              {it.label || it.q}
            </button>
          );
        })}
      </div>
    </div>
  );
}
