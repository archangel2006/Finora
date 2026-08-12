"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { C } from "@/lib/investment-copilot/constants";
import { Send, CheckCircle2 } from "@/components/investment-copilot/icons";
import CollapsibleTrace from "@/components/investment-copilot/ui/CollapsibleTrace";
import MemoCard from "@/components/investment-copilot/MemoCard";
import ComparisonOutput from "@/components/investment-copilot/ComparisonOutput";
import MetricOutput from "@/components/investment-copilot/MetricOutput";
import TextOutput from "@/components/investment-copilot/TextOutput";
import Toast from "@/components/investment-copilot/ui/Toast";

const SUGGESTED_QUESTIONS = [
  "Should we invest in NVIDIA for the next 5 years?",
  "Analyze Apple and summarize its key investment thesis",
  "Summarize Microsoft's latest earnings call",
  "Compare NVIDIA, Apple, and Microsoft",
  "What is Apple's current valuation and financial ratios?",
  "How is Microsoft's Azure AI revenue growing?",
];

/* ------------------------------------------------------------------ */
/*  CHAT PANEL                                                          */
/* ------------------------------------------------------------------ */
export default function ChatPanel({
  stickyHeader,
  messages,
  onAsk,
  placeholder,
}) {
  const [input, setInput] = useState("");
  const [toast, setToast] = useState(null);
  const [submittedMemos, setSubmittedMemos] = useState(new Set());
  const scrollRef = useRef(null);
  const chatFontSize = "13px";
  const chatCss = `
    .ic-chat * { font-size: ${chatFontSize} !important; }
    .ic-chat .font-serif { font-size: ${chatFontSize} !important; }
    .ic-chat .font-mono { font-size: ${chatFontSize} !important; }
    .ic-chat .font-medium { font-size: ${chatFontSize} !important; }
    .ic-chat .text-3xl { font-size: calc(${chatFontSize} * 2.2) !important; }
  `;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit() {
    if (input.trim()) {
      onAsk(input.trim());
      setInput("");
    }
  }

  function handleMemoSubmit(id) {
    setSubmittedMemos((prev) => new Set(prev).add(id));
    setToast("Investment memo submitted to Manager review queue");
    setTimeout(() => setToast(null), 3500);
  }

  function renderFollowUpSection(m) {
    if (!m.output) return null;

    const ticker = m.output.data?.ticker || "";
    const q = (m.text || "").toLowerCase();

    const followUps = m.output.data?.suggestedFollowups || [
      "Should we invest in NVIDIA for the next 5 years?",
      "Compare NVIDIA and AMD",
    ];

    const memoId = m.output.data?.id || m.id;
    const isSubmitted = submittedMemos.has(memoId);

    return (
      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: C.faint }}>
          Follow up on this
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {followUps.map((qText, idx) => (
            <button
              key={idx}
              onClick={() => onAsk(qText)}
              className="text-xs px-3 py-1.5 rounded-md border transition-all duration-150 shadow-sm"
              style={{ borderColor: C.line, color: C.text, background: C.panel }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.tealDim;
                e.currentTarget.style.borderColor = C.teal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.panel;
                e.currentTarget.style.borderColor = C.line;
              }}
            >
              {qText}
            </button>
          ))}

          {/* Submit button rendered inline next to follow-up chips */}
          {m.output.type === "memo" && (
            <button
              onClick={() => handleMemoSubmit(memoId)}
              disabled={isSubmitted}
              className="text-xs px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all duration-150 font-medium"
              style={
                isSubmitted
                  ? { background: C.successDim, borderColor: C.success, color: C.success, cursor: "default" }
                  : { background: C.successDim, borderColor: C.success, color: C.success }
              }
              onMouseEnter={(e) => {
                if (!isSubmitted) {
                  e.currentTarget.style.background = C.success;
                  e.currentTarget.style.color = "#FAF9F5";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitted) {
                  e.currentTarget.style.background = C.successDim;
                  e.currentTarget.style.color = C.success;
                }
              }}
            >
              <Send size={11} />
              {isSubmitted ? "Submitted for manager review" : "Submit for manager review"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 ic-chat" style={{ fontSize: chatFontSize }}>
      <style>{chatCss}</style>
      {stickyHeader}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ background: C.paper }}>
        
        {/* Suggested questions in the center when the chat is empty */}
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="font-serif text-2xl mb-2 font-medium" style={{ color: C.text }}>
              What would you like to research?
            </div>
            <p className="text-sm mb-8" style={{ color: C.muted }}>
              Select a query below to run a real-time analysis, or type your own.
            </p>
            <div className="grid grid-cols-2 gap-3.5 max-w-xl mx-auto text-left">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAsk(q, true)} // Trigger clearFirst = true
                  className="p-4 rounded-lg border text-sm leading-relaxed transition-all duration-150 shadow-sm font-sans"
                  style={{ borderColor: C.line, background: C.panel, color: C.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.tealDim;
                    e.currentTarget.style.borderColor = C.teal;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.panel;
                    e.currentTarget.style.borderColor = C.line;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div
                className="max-w-lg px-4 py-2.5 rounded-md text-sm shadow-sm"
                style={{ background: C.ink, color: "#FAF9F5" }}
              >
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="max-w-2xl">
              {/* Real-time execution status during loading & compact completed indicator when done */}
              <CollapsibleTrace
                isLoading={m.loading}
                liveSteps={m.liveSteps}
                currentStepIndex={m.currentStepIndex}
                completedSteps={m.completedTrace}
              />

              {/* Error state */}
              {m.error && !m.loading && (
                <div
                  className="rounded-md border px-4 py-3 text-sm"
                  style={{ borderColor: C.danger, background: C.dangerDim, color: C.danger }}
                >
                  {m.error}
                </div>
              )}

              {/* Structured Response Outputs */}
              {!m.loading && !m.error && m.output && (
                <>
                  {m.output.type === "memo" && (
                    <MemoCard
                      memo={{
                        ...m.output.data,
                        submitted: submittedMemos.has(m.output.data.id),
                      }}
                      mode="analyst"
                      onSubmit={handleMemoSubmit}
                    />
                  )}

                  {m.output.type === "comparison" && (
                    <ComparisonOutput data={m.output.data} />
                  )}

                  {m.output.type === "metric" && (
                    <div>
                      <MetricOutput data={m.output.data} />
                    </div>
                  )}

                  {m.output.type === "text" && (
                    <div>
                      <TextOutput data={m.output.data} />
                    </div>
                  )}

                  {/* Render extra joke / response text below the memo card / table */}
                  {m.output.data?.disclaimerNote && (
                    <div
                      className="mt-3 rounded-lg border p-4 shadow-sm"
                      style={{ borderColor: C.line, background: C.panel }}
                    >
                      <ReactMarkdown
                        className="text-sm leading-relaxed"
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-sm leading-relaxed mb-0" style={{ color: C.text }} {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic" style={{ color: C.text }} {...props} />
                          ),
                        }}
                      >
                        {m.output.data.disclaimerNote.replace(/^⚠️\s*/, "")}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Render Follow-up section immediately below the output card */}
                  {renderFollowUpSection(m)}
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* Input bar */}
      <div className="px-6 pt-1 pb-3 flex-shrink-0" style={{ background: C.paper }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md border shadow-sm"
          style={{ borderColor: C.line, background: C.panel }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.text }}
          />
          <button
            onClick={submit}
            className="flex-shrink-0 flex items-center justify-center rounded-md w-8 h-8 transition-colors"
            style={{ background: C.ink, color: "#FAF9F5" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Toast notification for dummy submit */}
      <Toast toast={toast} />
    </div>
  );
}
