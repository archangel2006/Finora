"use client";

import { C } from "@/lib/investment-copilot/constants";
import { ArrowLeft, Building2 } from "@/components/investment-copilot/icons";

export default function TopBar({ view, onBack }) {
  return (
    <div className="w-full flex items-center justify-between px-5 border-b flex-shrink-0" style={{ background: C.panel, borderColor: C.line, height: 54 }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: C.ink }}>
          <Building2 size={15} color="#FAF9F5" />
        </div>
        <span className="font-serif text-base tracking-wide" style={{ color: C.text }}>
          Investment Committee Copilot
        </span>
      </div>
      {(view === "analyst" || view === "manager") && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors"
          style={{ borderColor: C.line, color: C.muted }}>
          <ArrowLeft size={13} /> Switch persona
        </button>
      )}
    </div>
  );
}
