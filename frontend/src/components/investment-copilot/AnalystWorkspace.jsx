"use client";

import { useState } from "react";
import { C } from "@/lib/investment-copilot/constants";
import { RECENT_THREADS } from "@/lib/investment-copilot/data";
import { askInto } from "@/lib/investment-copilot/agentEngine";
import { ChevronRight, Plus, User } from "@/components/investment-copilot/icons";
import ChatPanel from "@/components/investment-copilot/ChatPanel";

/* ------------------------------------------------------------------ */
/*  ANALYST WORKSPACE                                                   */
/* ------------------------------------------------------------------ */
export default function AnalystWorkspace({ submitMemo }) {
  const [messages, setMessages] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // askInto is now async — fire-and-forget; state updates happen inside it
  function ask(text, clearFirst = false) {
    askInto(setMessages, text, null, clearFirst);
  }


  function loadThread(t) {
    setActiveThread(t.id);
    setMessages([
      { id: 1, role: "user", text: `What's the current view on ${t.label.split(",")[0]}?` },
      {
        id: 2,
        role: "agent",
        traceSteps: ["Retrieving prior research"],
        loading: false,
        error: null,
        followUps: null,
        output: {
          type: "text",
          data: {
            title: t.label,
            body: "This is a previously completed research thread, loaded from history for reference. Ask a new question below to start a fresh analysis.",
            citations: [],
          },
        },
      },
    ]);
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 border-r flex flex-col transition-all duration-200"
        style={{ borderColor: C.line, background: C.panel2, width: sidebarCollapsed ? 52 : 224 }}
      >
        <div className="p-2.5 border-b flex items-center gap-2" style={{ borderColor: C.lineSoft }}>
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex-shrink-0 flex items-center justify-center rounded-md w-7 h-7 border transition-colors"
            style={{ borderColor: C.line, color: C.muted }}
          >
            <ChevronRight
              size={13}
              style={{ transform: sidebarCollapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }}
            />
          </button>
          {!sidebarCollapsed && (
            <button
              onClick={() => { setMessages([]); setActiveThread(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ background: C.teal, color: "#FAF9F5" }}
            >
              <Plus size={15} /> New research
            </button>
          )}
        </div>

        {sidebarCollapsed ? (
          <div className="flex-1 flex flex-col items-center pt-2.5 gap-2">
            <button
              onClick={() => { setMessages([]); setActiveThread(null); }}
              title="New research"
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
              style={{ background: C.teal, color: "#FAF9F5" }}
            >
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-mono" style={{ color: C.faint }}>
              Recent research
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {RECENT_THREADS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => loadThread(t)}
                  className="w-full text-left px-2.5 py-2 rounded-md text-[13px] flex items-center justify-between"
                  style={{
                    background: activeThread === t.id ? C.panel : "transparent",
                    color: C.text,
                    border: activeThread === t.id ? `1px solid ${C.line}` : "1px solid transparent",
                  }}
                >
                  <span>{t.label}</span>
                  <ChevronRight size={13} style={{ color: C.faint }} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: C.lineSoft }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: C.tealDim }}>
            <User size={14} style={{ color: C.teal }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-[13px]" style={{ color: C.text }}>Priya Shah</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Investment Analyst</div>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <ChatPanel
        topContent={
          messages.length === 0 ? (
            <div className="max-w-xl mx-auto mt-10 text-center">
              <div className="font-serif text-xl mb-1" style={{ color: C.text }}>
                What would you like to research?
              </div>
              <p className="text-sm" style={{ color: C.muted }}>
                Ask about a company, financial metric, or comparison.
              </p>
            </div>
          ) : null
        }
        messages={messages}
        onAsk={ask}
        placeholder="Ask about a company, comparison, or metric..."
      />
    </div>
  );
}
