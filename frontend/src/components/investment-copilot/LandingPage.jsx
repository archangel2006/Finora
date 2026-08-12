"use client";

import { C } from "@/lib/investment-copilot/constants";
import { ArrowRight } from "@/components/investment-copilot/icons";

/* ------------------------------------------------------------------ */
/*  LANDING PAGE                                                        */
/* ------------------------------------------------------------------ */
export default function LandingPage({ onEnter }) {
  const features = [
    { title: "Grounded research", body: "Every answer is backed by real filings, transcripts, and live market data, with citations attached." },
    { title: "Agentic tool use", body: "The copilot plans its own sequence of retrieval, calculation, and comparison steps based on what you ask." },
    { title: "Human in the loop", body: "Analysts draft. Managers decide. Nothing is approved or rejected without a person in the loop." },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: C.paper }}>
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-md border mb-6" style={{ borderColor: C.line, color: C.muted }}>
          Your Investment Research Asistant
        </div>
        <h1 className="font-serif text-4xl mb-4" style={{ color: C.text }}>Investment Committee Copilot</h1>
        <p className="text-base mb-10" style={{ color: C.muted }}>
          An agentic due diligence assistant that turns a single question into a fully
          researched, cited investment memo, ready for manager review.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10 text-left">
          {features.map((f, i) => (
            <div key={i} className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <div className="text-sm font-medium mb-1" style={{ color: C.teal }}>{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{f.body}</div>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors" style={{ background: C.ink, color: "#FAF9F5" }}>
          Enter the platform <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
