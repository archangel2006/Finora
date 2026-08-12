"use client";

import { useState } from "react";
import { C } from "@/lib/investment-copilot/constants";
import { QUEUE_SEED } from "@/lib/investment-copilot/data";
import TickerTape from "@/components/investment-copilot/ui/TickerTape";
import TopBar from "@/components/investment-copilot/ui/TopBar";
import Toast from "@/components/investment-copilot/ui/Toast";
import LandingPage from "@/components/investment-copilot/LandingPage";
import PersonaSelect from "@/components/investment-copilot/PersonaSelect";
import AnalystWorkspace from "@/components/investment-copilot/AnalystWorkspace";
import ManagerWorkspace from "@/components/investment-copilot/ManagerWorkspace";

/* ------------------------------------------------------------------ */
/*  ROOT APP                                                            */
/* ------------------------------------------------------------------ */
export default function InvestmentCopilotApp() {
  const [view, setView] = useState("landing");
  const [queue, setQueue] = useState(QUEUE_SEED);
  const [toast, setToast] = useState(null);
  const globalCss = `
    /* Minimal fallback styles so the prototype looks reasonable without Tailwind */
    html,body,#root { height: 100%; }
    body { margin: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; background: ${C.paper}; color: ${C.text}; }
    .font-serif { font-family: Georgia, 'Times New Roman', serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; }
    .text-sm { font-size: 13px; }
    .text-xs { font-size: 11px; }
    .text-base { font-size: 15px; }
    .text-xl { font-size: 20px; }
    .text-4xl { font-size: 36px; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .rounded-md { border-radius: 6px; }
    .border { border: 1px solid ${C.line}; }
    /* Ensure chat wrapper smaller fonts apply even on landing */
    .ic-chat * { font-size: 13px !important; }
  `;

  function submitMemo(memo) {
    setQueue((prev) => {
      if (prev.some((m) => m.id === memo.id)) return prev;
      return [{ ...memo }, ...prev];
    });
    setToast("Memo sent to Investment Manager for review");
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <div className="flex flex-col h-screen font-sans" style={{ background: C.paper }}>
      <style>{globalCss}</style>
      <TickerTape />
      <TopBar view={view} onBack={() => setView("select")} />
      {view === "landing" && <LandingPage onEnter={() => setView("select")} />}
      {view === "select" && <PersonaSelect onSelect={setView} onBack={() => setView("landing")} />}
      {view === "analyst" && <AnalystWorkspace submitMemo={submitMemo} />}
      {view === "manager" && <ManagerWorkspace queue={queue} setQueue={setQueue} />}
      <Toast toast={toast} />
    </div>
  );
}
