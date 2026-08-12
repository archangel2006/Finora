"use client";

import { C } from "@/lib/investment-copilot/constants";
import { ArrowLeft, ChevronRight, User, Briefcase } from "@/components/investment-copilot/icons";

/* ------------------------------------------------------------------ */
/*  PERSONA SELECT                                                      */
/* ------------------------------------------------------------------ */
export default function PersonaSelect({ onSelect, onBack }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: C.paper }}>
      <div className="text-center mb-10 max-w-lg">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs mx-auto mb-6" style={{ color: C.faint }}>
          <ArrowLeft size={13} /> Back
        </button>
        <h1 className="font-serif text-2xl mb-3" style={{ color: C.text }}>Choose a persona</h1>
        <p className="text-sm" style={{ color: C.muted }}>See how the platform works from each side of the review process.</p>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full max-w-2xl">
        <button onClick={() => onSelect("analyst")} className="rounded-lg border p-6 text-left transition-colors" style={{ borderColor: C.line, background: C.panel }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.teal)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}>
          <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4" style={{ background: C.tealDim }}>
            <User size={20} style={{ color: C.teal }} />
          </div>
          <div className="font-serif text-lg mb-1" style={{ color: C.text }}>Investment Analyst</div>
          <p className="text-sm mb-3" style={{ color: C.muted }}>Research companies, run comparisons, and draft memos with the agent.</p>
          <span className="text-xs inline-flex items-center gap-1" style={{ color: C.teal }}>Enter as Analyst <ChevronRight size={13} /></span>
        </button>
        <button onClick={() => onSelect("manager")} className="rounded-lg border p-6 text-left transition-colors" style={{ borderColor: C.line, background: C.panel }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}>
          <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4" style={{ background: C.amberDim }}>
            <Briefcase size={20} style={{ color: C.amber }} />
          </div>
          <div className="font-serif text-lg mb-1" style={{ color: C.text }}>Investment Manager</div>
          <p className="text-sm mb-3" style={{ color: C.muted }}>Review submitted memos, ask follow ups, and approve or reject.</p>
          <span className="text-xs inline-flex items-center gap-1" style={{ color: C.amber }}>Enter as Manager <ChevronRight size={13} /></span>
        </button>
      </div>
    </div>
  );
}
