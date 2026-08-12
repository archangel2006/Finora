"use client";

import { useState } from "react";
import { C } from "@/lib/investment-copilot/constants";
import { MANAGER_CHIPS, MEMO_FOLLOWUPS } from "@/lib/investment-copilot/data";
import {
  askInto, askMemoFollowUp, askManagerFollowUp, memoFreeAskInto,
} from "@/lib/investment-copilot/agentEngine";
import {
  ChevronRight, Plus, Briefcase, ThumbsUp, ThumbsDown, RotateCcw,
} from "@/components/investment-copilot/icons";
import ConfidencePill from "@/components/investment-copilot/ui/ConfidencePill";
import StatusBadge from "@/components/investment-copilot/ui/StatusBadge";
import ChatPanel from "@/components/investment-copilot/ChatPanel";
import MemoCard from "@/components/investment-copilot/MemoCard";

/* ------------------------------------------------------------------ */
/*  MANAGER WORKSPACE                                                   */
/* ------------------------------------------------------------------ */
export default function ManagerWorkspace({ queue, setQueue }) {
  const [selectedId, setSelectedId] = useState(queue[0]?.id || null);
  const [generalMessages, setGeneralMessages] = useState([]);
  const [memoThreads, setMemoThreads] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const selected = queue.find((q) => q.id === selectedId) || null;

  function setMemoThreadFn(memoId) {
    return (updater) => setMemoThreads((prev) => ({ ...prev, [memoId]: updater(prev[memoId] || []) }));
  }

  function handleDecision(id, decision) {
    setQueue((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Decided", decision } : m)));
  }

  function generalAsk(text, key) {
    askInto(setGeneralMessages, text, key);
  }

  // Every question the manager asks — whether it's one of the memo's own
  // curated follow-ups or one of the static "dummy" starter questions —
  // goes through the same memory-check-first pattern: check the memo's
  // session context first, and only fall through to additional tool calls
  // (search_docs, live data fetch, recalculation, etc.) on a genuine miss.
  function memoChipClick(item) {
    if (!selected) return;
    if (item.q) {
      // If the follow-up is flagged as inMemory=false, use the richer
      // manager follow-up trace so tools are shown in the agent trace.
      if (item.inMemory === false) {
        askManagerFollowUp(setMemoThreadFn(selected.id), item);
      } else {
        askMemoFollowUp(setMemoThreadFn(selected.id), item);
      }
    } else {
      askManagerFollowUp(setMemoThreadFn(selected.id), {
        q: item.label,
        inMemory: false,
        extraSteps: [`search_docs("${item.label}")`, "fetch_live_market_data()"],
        a: "Based on the memo and underlying filings, the current evidence does not materially change once you factor that in. Flag it in committee discussion if new data emerges next quarter.",
      });
    }
  }

  function onChipOrDummyClick(item) {
    if (selected) {
      if (item && item.action === "decision_recommendation") {
        handleDecision(selected.id, item.decision);
        return;
      }
      memoChipClick(item);
    } else {
      generalAsk(item.label, item.key);
    }
  }

  function memoFreeAsk(text) {
    if (!selected) return;
    memoFreeAskInto(setMemoThreadFn(selected.id), text);
  }

  const pending = queue.filter((q) => q.status !== "Decided");
  const decided = queue.filter((q) => q.status === "Decided");

  const stickyHeader = selected ? (
    <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: C.line, background: C.panel }}>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-base" style={{ color: C.text }}>{selected.company}</span>
          <span className="font-mono text-xs" style={{ color: C.faint }}>{selected.ticker}</span>
          <StatusBadge status={selected.status} decision={selected.decision} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm" style={{ color: C.teal }}>{selected.thesis}</span>
          <ConfidencePill value={selected.confidence} />
        </div>
      </div>
      {selected.status !== "Decided" ? (
        <div className="flex gap-2">
          <button onClick={() => handleDecision(selected.id, "Approved")} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors" style={{ background: C.successDim, color: C.success }}>
            <ThumbsUp size={14} /> Approve
          </button>
          {/* Requesting edits/revisions to a memo is a manager action, not
              an analyst one — the analyst only drafts and submits. */}
          <button onClick={() => handleDecision(selected.id, "Revisions Requested")} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors" style={{ background: C.amberDim, color: C.amber }}>
            <RotateCcw size={14} /> Request revision
          </button>
          <button onClick={() => handleDecision(selected.id, "Rejected")} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors" style={{ background: C.dangerDim, color: C.danger }}>
            <ThumbsDown size={14} /> Reject
          </button>
        </div>
      ) : (
        <div className="text-xs" style={{ color: C.faint }}>Decision recorded</div>
      )}
    </div>
  ) : null;

  const topContent = selected ? (
    <div className="max-w-2xl mx-auto mb-2">
      <div className="text-sm mb-3" style={{ color: C.muted }}>
        Original question: <span style={{ color: C.text }}>{selected.question}</span>
      </div>
      <MemoCard memo={selected} mode="readonly" />
    </div>
  ) : (
    <div className="max-w-xl mx-auto mt-10 text-center">
      <div className="font-serif text-xl mb-1" style={{ color: C.text }}>Ask the copilot anything</div>
      <p className="text-sm" style={{ color: C.muted }}>General research works the same way it does for analysts. Select a memo on the left to review and decide.</p>
    </div>
  );

  const messages = selected ? memoThreads[selected.id] || [] : generalMessages;
  // The memo's own curated follow-ups appear right under the memo itself,
  // before the manager has asked anything — mirroring how later follow-ups
  // sit right under each response rather than in a floating footer.
  const topFollowUps = selected && messages.length === 0 ? (MEMO_FOLLOWUPS[selected.ticker] || []) : null;

  return (
    <div className="flex flex-1 min-h-0">
      <div
        className="flex-shrink-0 border-r flex flex-col transition-all duration-200"
        style={{ borderColor: C.line, background: C.panel2, width: sidebarCollapsed ? 52 : 256 }}
      >
        <div className="p-2.5 border-b flex items-center gap-2" style={{ borderColor: C.lineSoft }}>
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex-shrink-0 flex items-center justify-center rounded-md w-7 h-7 border transition-colors"
            style={{ borderColor: C.line, color: C.muted }}
          >
            <ChevronRight size={13} style={{ transform: sidebarCollapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }} />
          </button>
          {!sidebarCollapsed && (
            <button onClick={() => setSelectedId(null)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors" style={{ background: C.amber, color: "#FAF9F5" }}>
              <Plus size={15} /> New research
            </button>
          )}
        </div>

        {sidebarCollapsed ? (
          <div className="flex-1 flex flex-col items-center pt-2.5 gap-2 overflow-y-auto">
            <button onClick={() => setSelectedId(null)} title="New research"
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
              style={{ background: C.amber, color: "#FAF9F5" }}>
              <Plus size={15} />
            </button>
            {[...pending, ...decided].map((m) => (
              <button key={m.id} onClick={() => setSelectedId(m.id)} title={`${m.company} — ${m.thesis}`}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-mono font-medium"
                style={{ background: selectedId === m.id ? C.panel : "transparent", border: selectedId === m.id ? `1px solid ${C.line}` : "1px solid transparent", color: C.text }}>
                {m.ticker.slice(0, 2)}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: C.faint }}>Review queue</span>
              <span className="text-[11px]" style={{ color: C.faint }}>{pending.length} pending</span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {[...pending, ...decided].map((m) => (
                <button key={m.id} onClick={() => setSelectedId(m.id)}
                  className="w-full text-left px-3 py-3 rounded-md"
                  style={{ background: selectedId === m.id ? C.panel : "transparent", border: selectedId === m.id ? `1px solid ${C.line}` : "1px solid transparent" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: C.text }}>{m.company}</span>
                    <StatusBadge status={m.status} decision={m.decision} />
                  </div>
                  <div className="text-xs" style={{ color: C.faint }}>{m.author}, {m.thesis}</div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: C.lineSoft }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: C.amberDim }}>
            <Briefcase size={14} style={{ color: C.amber }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-[13px]" style={{ color: C.text }}>David Ortega</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Investment Manager</div>
            </div>
          )}
        </div>
      </div>

      <ChatPanel
        stickyHeader={stickyHeader}
        topContent={topContent}
        topFollowUps={topFollowUps}
        topFollowUpsLabel="Ask about this memo"
        messages={messages}
        onInlineChipClick={onChipOrDummyClick}
        dummyQs={MANAGER_CHIPS}
        view={"manager"}
        dummyLabel="Try asking"
        onDummyClick={onChipOrDummyClick}
        onAsk={(text) => (selected ? memoFreeAsk(text) : generalAsk(text, null))}
        placeholder={selected ? "Ask a follow up about this memo..." : "Ask about a company, comparison, or metric..."}
      />
    </div>
  );
}
