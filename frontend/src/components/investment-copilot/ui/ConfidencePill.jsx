"use client";

import { C } from "@/lib/investment-copilot/constants";

export default function ConfidencePill({ value }) {
  const tone = value >= 70 ? C.success : value >= 45 ? C.amber : C.danger;
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-md border" style={{ color: tone, borderColor: tone }}>
      {value}% confidence
    </span>
  );
}
