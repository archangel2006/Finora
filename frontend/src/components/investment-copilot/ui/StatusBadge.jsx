"use client";

import { C } from "@/lib/investment-copilot/constants";

export default function StatusBadge({ status, decision }) {
  const map = {
    "Pending Review": { bg: C.amberDim, fg: C.amber },
    Decided: {
      bg: decision === "Rejected" ? C.dangerDim : decision === "Revisions Requested" ? C.amberDim : C.successDim,
      fg: decision === "Rejected" ? C.danger : decision === "Revisions Requested" ? C.amber : C.success,
    },
  };
  const s = map[status] || map["Pending Review"];
  const label = status === "Decided" ? decision : status;
  return <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: s.bg, color: s.fg }}>{label}</span>;
}
