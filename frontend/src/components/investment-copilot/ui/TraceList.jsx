"use client";

import { C } from "@/lib/investment-copilot/constants";
import { CheckCircle2, Circle, Loader2 } from "@/components/investment-copilot/icons";

export default function TraceList({ steps, activeIndex, done }) {
  return (
    <div className="rounded-md border px-4 py-3 mb-2" style={{ background: C.panel2, borderColor: C.lineSoft }}>
      <div className="text-xs uppercase tracking-wider mb-2 font-mono" style={{ color: C.faint }}>Agent trace</div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const complete = i < activeIndex || done;
          const active = i === activeIndex && !done;
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              {complete ? (
                <CheckCircle2 size={15} style={{ color: C.success }} />
              ) : active ? (
                <Loader2 size={15} className="animate-spin" style={{ color: C.teal }} />
              ) : (
                <Circle size={15} style={{ color: C.faint }} />
              )}
              <span style={{ color: complete || active ? C.text : C.faint }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
