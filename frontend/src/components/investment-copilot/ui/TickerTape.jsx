"use client";

import { C, TICKER } from "@/lib/investment-copilot/constants";

export default function TickerTape() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="w-full overflow-hidden border-b flex items-center" style={{ background: C.panel2, borderColor: C.line, height: 32 }}>
      <style>{`
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: tickerScroll 28s linear infinite; }
      `}</style>
      <div className="flex ticker-track whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center font-mono text-xs px-4">
            <span style={{ color: C.muted }}>{t.s}</span>
            <span className="ml-2" style={{ color: C.text }}>{t.p.toFixed(2)}</span>
            <span className="ml-2" style={{ color: t.c >= 0 ? C.success : C.danger }}>
              {t.c >= 0 ? "up" : "down"} {Math.abs(t.c).toFixed(2)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
