"use client";

import { useState } from "react";
import { C } from "@/lib/investment-copilot/constants";
import { ChevronRight, CheckCircle2, Loader2 } from "@/components/investment-copilot/icons";

/* ------------------------------------------------------------------ */
/*  LIVE EXECUTION STATUS & COMPACT TRACE INDICATOR                     */
/*                                                                      */
/*  - While loading: displays live execution status advancing step-by-step */
/*  - When completed: displays a small unobtrusive status line with check */
/*  - NO "View analysis trace" / "Hide analysis trace" text buttons      */
/* ------------------------------------------------------------------ */
export default function CollapsibleTrace({
  isLoading,
  liveSteps = [],
  currentStepIndex = 0,
  completedSteps = [],
}) {
  const [open, setOpen] = useState(false);

  // 1. LOADING STATE — Live status indicator
  if (isLoading) {
    const currentStep = liveSteps[currentStepIndex] || liveSteps[0] || "Processing request...";
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-xs mb-2 transition-all duration-200"
        style={{
          background: C.panel2,
          border: `1px solid ${C.lineSoft}`,
          color: C.text,
        }}
      >
        <Loader2 size={13} className="animate-spin flex-shrink-0" style={{ color: C.teal }} />
        <span className="font-mono">{currentStep}</span>
      </div>
    );
  }

  // 2. COMPLETED STATE — Hide completely if no relevant steps were executed
  if (!completedSteps || completedSteps.length === 0) {
    return null;
  }

  // Compact completed status element
  return (
    <div className="mb-2 rounded-md border overflow-hidden" style={{ borderColor: C.lineSoft }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors"
        style={{ background: C.panel2, color: C.muted }}
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="flex-shrink-0" style={{ color: C.success }} />
          <span className="font-mono text-[11px]">
            Analysis complete ({completedSteps.length} {completedSteps.length === 1 ? "step" : "steps"})
          </span>
        </div>
        <ChevronRight
          size={12}
          style={{
            color: C.faint,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {/* Expanded body showing clean completed steps */}
      {open && (
        <div className="px-3 py-2 space-y-1" style={{ background: C.panel2 }}>
          {completedSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-mono" style={{ color: C.text }}>
              <CheckCircle2 size={11} className="flex-shrink-0" style={{ color: C.success }} />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
