"use client";

import { C } from "@/lib/investment-copilot/constants";
import { CheckCircle2 } from "@/components/investment-copilot/icons";

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 px-4 py-3 rounded-md border shadow-md flex items-center gap-2 z-50" style={{ background: C.panel, borderColor: C.line, color: C.text }}>
      <CheckCircle2 size={16} style={{ color: C.success }} />
      <span className="text-sm">{toast}</span>
    </div>
  );
}
