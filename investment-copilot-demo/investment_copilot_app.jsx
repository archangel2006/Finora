import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Send, CheckCircle2, Circle, Loader2, FileText,
  TrendingUp, TrendingDown, ShieldAlert, ChevronRight, RotateCcw, ThumbsUp,
  ThumbsDown, Building2, MessageSquare, Plus, User, Briefcase, Database,
  AlertTriangle, Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TOKENS — light, professional                                       */
/* ------------------------------------------------------------------ */
const C = {
  paper: "#FAF9F5",
  panel: "#FFFFFF",
  panel2: "#F3F1E9",
  line: "#E3E0D4",
  lineSoft: "#EDEAE0",
  ink: "#14213B",
  text: "#1D2739",
  muted: "#5E6A80",
  faint: "#94A0B2",
  teal: "#0F7A6E",
  tealDim: "#E2F2EF",
  amber: "#9C6B15",
  amberDim: "#F3E7CB",
  success: "#22794F",
  successDim: "#E1F1E7",
  danger: "#B23B30",
  dangerDim: "#FBE7E4",
};

const TICKER = [
  { s: "NVDA", p: 141.22, c: 2.35 },
  { s: "AMD", p: 168.9, c: -1.12 },
  { s: "INTC", p: 22.47, c: 0.31 },
  { s: "TSM", p: 189.6, c: 3.02 },
  { s: "MSFT", p: 512.3, c: 1.8 },
  { s: "GOOGL", p: 201.1, c: -0.44 },
  { s: "AVGO", p: 244.8, c: 4.6 },
];

/* ------------------------------------------------------------------ */
/*  DUMMY DOMAIN DATA                                                   */
/* ------------------------------------------------------------------ */
const NVDA_MEMO = {
  id: "memo-1",
  ticker: "NVDA",
  company: "NVIDIA Corporation",
  thesis: "Long-Term Buy",
  confidence: 82,
  author: "Priya Shah",
  status: "Pending Review",
  question: "Should we invest in NVIDIA for the next five years?",
  summary:
    "NVIDIA remains the dominant supplier of AI training and inference silicon, with data center revenue compounding on the back of hyperscaler capex cycles. Gross margins near 75% and a widening CUDA software moat support a multi-year growth runway. Near-term risk comes from customer concentration and export policy, but the five-year thesis is favorable on current evidence.",
  financials: [
    { label: "Price", value: "$141.22" },
    { label: "Market Cap", value: "$3.47T" },
    { label: "P/E (TTM)", value: "64.2x" },
    { label: "Revenue Growth (YoY)", value: "+94%" },
    { label: "Gross Margin", value: "75.0%" },
    { label: "ROE", value: "91.5%" },
  ],
  comparison: [
    { metric: "P/E (TTM)", nvda: "64.2x", amd: "112.4x", intc: "n/a" },
    { metric: "Revenue Growth", nvda: "+94%", amd: "+18%", intc: "-8%" },
    { metric: "Gross Margin", nvda: "75.0%", amd: "53.6%", intc: "40.1%" },
    { metric: "Market Cap", nvda: "$3.47T", amd: "$226B", intc: "$98B" },
  ],
  risks: [
    "Revenue concentration among a small number of hyperscale customers",
    "Export restrictions on advanced accelerators to China",
    "Rising competition from custom silicon such as Google TPU and AWS Trainium",
    "Valuation sensitive to any slowdown in AI infrastructure capex",
  ],
  citations: [
    "NVIDIA 10-K, FY2026, Item 7 MD&A",
    "Q1 FY2027 Earnings Call Transcript",
    "NVIDIA Investor Presentation, June 2026",
  ],
};

const QUEUE_SEED = [
  {
    id: "memo-2",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    thesis: "Hold, Watch Data Center Share",
    confidence: 58,
    author: "Marcus Tan",
    status: "Pending Review",
    question: "Compare AMD's position against NVIDIA and Intel.",
    summary:
      "AMD is gaining server CPU share from Intel and shipping MI300 series accelerators, but remains a distant second in AI silicon behind NVIDIA. Margins trail both peers. Position sizing should stay modest until data center GPU attach rates prove out.",
    financials: [
      { label: "Price", value: "$168.90" },
      { label: "Market Cap", value: "$226B" },
      { label: "P/E (TTM)", value: "112.4x" },
      { label: "Revenue Growth (YoY)", value: "+18%" },
      { label: "Gross Margin", value: "53.6%" },
      { label: "ROE", value: "8.9%" },
    ],
    comparison: [
      { metric: "P/E (TTM)", nvda: "64.2x", amd: "112.4x", intc: "n/a" },
      { metric: "Revenue Growth", nvda: "+94%", amd: "+18%", intc: "-8%" },
      { metric: "Gross Margin", nvda: "75.0%", amd: "53.6%", intc: "40.1%" },
      { metric: "Market Cap", nvda: "$3.47T", amd: "$226B", intc: "$98B" },
    ],
    risks: [
      "Still a distant number two in AI accelerators by unit share",
      "Thinner margins limit reinvestment pace versus NVIDIA",
      "Server CPU gains could stall if Intel's turnaround lands",
    ],
    citations: ["AMD 10-Q, Q1 2026", "AMD Q1 2026 Earnings Call Transcript"],
  },
  {
    id: "memo-3",
    ticker: "INTC",
    company: "Intel Corporation",
    thesis: "Avoid, Turnaround Unproven",
    confidence: 34,
    author: "Priya Shah",
    status: "Decided",
    decision: "Rejected",
    question: "Is Intel's foundry turnaround investable yet?",
    summary:
      "Intel's foundry strategy remains capital intensive with revenue still contracting. Until external foundry customers materialize at scale, the risk and reward does not clear the bar for a new position.",
    financials: [
      { label: "Price", value: "$22.47" },
      { label: "Market Cap", value: "$98B" },
      { label: "P/E (TTM)", value: "n/a" },
      { label: "Revenue Growth (YoY)", value: "-8%" },
      { label: "Gross Margin", value: "40.1%" },
      { label: "ROE", value: "-6.2%" },
    ],
    comparison: [
      { metric: "P/E (TTM)", nvda: "64.2x", amd: "112.4x", intc: "n/a" },
      { metric: "Revenue Growth", nvda: "+94%", amd: "+18%", intc: "-8%" },
      { metric: "Gross Margin", nvda: "75.0%", amd: "53.6%", intc: "40.1%" },
      { metric: "Market Cap", nvda: "$3.47T", amd: "$226B", intc: "$98B" },
    ],
    risks: [
      "Foundry segment still operating at a loss",
      "Limited external customer commitments disclosed to date",
      "Execution risk on next node process ramp",
    ],
    citations: ["Intel 10-K, FY2025", "Intel Foundry Direct Connect 2026 Presentation"],
  },
];

const ANALYST_CHIPS = [
  { label: "Should we invest in NVIDIA for the next 5 years?", key: "nvda_thesis" },
  { label: "Compare NVIDIA and AMD", key: "compare" },
  { label: "What's AMD's current P/E vs. the sector average?", key: "amd_pe" },
  { label: "Summarize NVIDIA's latest earnings call", key: "earnings" },
];

const MANAGER_CHIPS = [
  { label: "Request more citations", key: "req_citations" },
  { label: "Ask for sensitivity analysis (revenue/capex)", key: "sensitivity" },
  { label: "Request position sizing recommendation", key: "position_size" },
];

const RECENT_THREADS = [
  { id: "t1", label: "TSMC, Supply Chain Risk" },
  { id: "t2", label: "Intel, Turnaround Thesis" },
  { id: "t3", label: "Broadcom, AI Networking" },
];

/* Follow-ups carry an inMemory flag: true = the manager's question is
   already covered by the current session's memo context, so we skip
   re-running research tools and answer straight from memory. false =
   genuinely new ground, so the trace shows a memory-check miss followed
   by only the extra tool(s) the answer actually needs. */
const MEMO_FOLLOWUPS = {
  NVDA: [
    {
      q: "How would a decline in AI infrastructure spending affect this thesis?", inMemory: false,
      extraSteps: ["Recalculating sensitivity: capex slowdown scenario"],
      a: "A meaningful pullback in AI infrastructure capex would slow data center revenue growth and compress the current multiple, but would not change the multi-year thesis given NVIDIA's software moat and backlog visibility. Recommend revisiting position sizing rather than the thesis itself."
    },
    {
      q: "What is the customer concentration risk here?", inMemory: true,
      a: "The top four hyperscale customers account for a large share of data center revenue. A pull back from any single customer would be noticeable, though order backlogs across the group currently provide some cushion."
    },
    {
      q: "How does this compare with AMD on margins?", inMemory: true,
      a: "NVIDIA's gross margin near 75% is well above AMD's 53.6%, reflecting NVIDIA's pricing power in high end accelerators and a more mature software stack around CUDA."
    },
  ],
  AMD: [
    {
      q: "How competitive is AMD's MI300 line against NVIDIA's current generation?", inMemory: false,
      extraSteps: ["Retrieving MI300 vs. Blackwell benchmark data (RAG)"],
      a: "MI300 series accelerators are gaining design wins in select workloads, but NVIDIA still leads on software ecosystem maturity and total available performance per rack."
    },
    {
      q: "What would need to be true for this to become a buy?", inMemory: true,
      a: "A buy case would need clearer evidence of data center GPU attach rate growth and gross margin expansion toward the mid 60s, alongside continued server CPU share gains."
    },
    {
      q: "How does AMD's valuation compare with the sector?", inMemory: false,
      extraSteps: ["Fetching live sector P/E average"],
      a: "AMD trades at 112.4x trailing earnings versus a semiconductor sector average near 41.8x, pricing in AI accelerator share gains that have not yet fully shown up in reported revenue."
    },
  ],
  INTC: [
    {
      q: "Is the foundry business showing signs of improvement?", inMemory: false,
      extraSteps: ['search_docs("Intel foundry quarterly revenue trend")'],
      a: "Foundry revenue is still running below internal targets and the segment remains loss making. External customer commitments disclosed so far are limited relative to the capital being deployed."
    },
    {
      q: "What would change this from a reject to a hold?", inMemory: true,
      a: "Visible external foundry customer wins at scale, alongside a credible path to segment profitability, would be the clearest signal to revisit this position."
    },
    {
      q: "How does Intel's foundry margin compare with TSMC?", inMemory: false,
      extraSteps: ['search_docs("TSMC foundry gross margin FY2026")'],
      a: "Intel's foundry margins remain well below TSMC's, reflecting TSMC's scale advantages and more mature process yields."
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  CANNED AGENT RESPONSES (fresh research — full trace)                */
/* ------------------------------------------------------------------ */
function buildResponse(key, text) {
  if (key === "nvda_thesis") {
    return {
      steps: [
        "Classifying intent: company deep dive",
        "Retrieving 10-K, 10-Q and earnings transcripts (RAG)",
        "Fetching live market data",
        "Calculating valuation and profitability ratios",
        "Comparing NVIDIA vs. AMD, Intel",
        "Drafting investment memo",
      ],
      output: { type: "memo", data: { ...NVDA_MEMO } },
      followUps: [
        { label: "Compare NVIDIA and AMD", key: "compare" },
        { label: "Summarize NVIDIA's latest earnings call", key: "earnings" },
        { label: "Submit for manager review", action: "submit" },
      ],
    };
  }
  if (key === "compare") {
    return {
      steps: [
        "Classifying intent: competitive comparison",
        "Fetching live market data for NVDA, AMD, INTC",
        "Calculating comparative ratios",
        "Generating comparison table",
      ],
      output: {
        type: "comparison",
        data: {
          title: "NVIDIA vs. AMD vs. Intel",
          rows: NVDA_MEMO.comparison,
          note:
            "NVIDIA leads on growth and margin. AMD trades at a richer multiple relative to growth. Intel lags on both fronts.",
        },
      },
      followUps: [
        { label: "Should we invest in NVIDIA for the next 5 years?", key: "nvda_thesis" },
        { label: "What's AMD's current P/E vs. the sector average?", key: "amd_pe" },
        { label: "Summarize NVIDIA's latest earnings call", key: "earnings" },
      ],
    };
  }
  if (key === "amd_pe") {
    return {
      steps: [
        "Classifying intent: single metric lookup",
        "Fetching live market data for AMD",
        "Calculating P/E vs. semiconductor sector average",
      ],
      output: {
        type: "metric",
        data: {
          label: "AMD, P/E (TTM)",
          value: "112.4x",
          sub: "Sector average (semis): 41.8x",
          tone: "amber",
          note: "AMD trades well above the sector average, pricing in significant AI accelerator share gains that have not yet shown up in reported revenue.",
        },
      },
      followUps: [
        { label: "Compare NVIDIA and AMD", key: "compare" },
        { label: "Should we invest in NVIDIA for the next 5 years?", key: "nvda_thesis" },
        { label: "Summarize NVIDIA's latest earnings call", key: "earnings" },
      ],
    };
  }
  if (key === "earnings") {
    return {
      steps: [
        "Classifying intent: document summarization",
        "Retrieving latest earnings call transcript (RAG)",
        "Synthesizing key points",
      ],
      output: {
        type: "text",
        data: {
          title: "NVIDIA, Q1 FY2027 Earnings Call Summary",
          body:
            "Management reiterated strong data center demand, citing multi-quarter order visibility from hyperscale customers. Gross margin guidance held near 75%, with commentary flagging tight supply on next generation accelerators. Leadership addressed export policy questions directly, noting the China contribution is now a smaller share of total revenue than in prior cycles.",
          citations: ["Q1 FY2027 Earnings Call Transcript", "CFO Commentary, Investor Relations"],
        },
      },
      followUps: [
        { label: "Compare NVIDIA and AMD", key: "compare" },
        { label: "Should we invest in NVIDIA for the next 5 years?", key: "nvda_thesis" },
        { label: "What's AMD's current P/E vs. the sector average?", key: "amd_pe" },
      ],
    };
  }
  return {
    steps: ["Classifying intent", "Retrieving sample data (demo mode)", "Drafting response"],
    output: {
      type: "text",
      data: {
        title: "Demo response",
        body:
          "This prototype runs on fixed sample data. Try one of the suggested questions below, or ask about NVIDIA, AMD, or Intel to see the full agent workflow.",
        citations: [],
      },
    },
    followUps: ANALYST_CHIPS,
  };
}

/* ------------------------------------------------------------------ */
/*  GENERIC CHAT ENGINE (fresh research — full tool trace)              */
/* ------------------------------------------------------------------ */
function askInto(setFn, text, key) {
  const resp = buildResponse(key, text);
  const userMsg = { id: Date.now() + Math.random(), role: "user", text };
  const agentMsg = {
    id: Date.now() + Math.random() + 1,
    role: "agent",
    steps: resp.steps,
    activeIndex: 0,
    done: false,
    output: null,
    finalOutput: resp.output,
    followUps: resp.followUps,
  };
  setFn((prev) => [...prev, userMsg, agentMsg]);
  stepTraceGeneric(setFn, agentMsg.id, resp.steps.length);
}

function stepTraceGeneric(setFn, id, total) {
  let i = 0;
  const tick = () => {
    i += 1;
    setFn((prev) =>
      prev.map((m) =>
        m.id === id
          ? i >= total
            ? { ...m, activeIndex: total, done: true, output: m.finalOutput }
            : { ...m, activeIndex: i }
          : m
      )
    );
    if (i < total) setTimeout(tick, 550);
  };
  setTimeout(tick, 450);
}

/* Memory-check-first pattern for memo follow-ups: every follow-up first
   runs a cheap check_memo() step against the session's own context. If the
   manager's question is already covered (inMemory: true), the trace stops
   there and no research tools are re-invoked. Only a genuine miss falls
   through to the extra tool(s) the answer actually needs. */
function askMemoFollowUp(setFn, item) {
  const steps = item.inMemory
    ? ["check_memo(\"session context\")", "Found in memo context — answering directly, no tools re-invoked"]
    : ["check_memo(\"session context\")", "Not covered in memo context", ...(item.extraSteps || []), "Synthesizing answer"];
  const userMsg = { id: Date.now() + Math.random(), role: "user", text: item.q };
  const agentMsg = {
    id: Date.now() + Math.random() + 1,
    role: "agent",
    steps,
    activeIndex: 0,
    done: false,
    output: null,
    finalOutput: { type: "text", data: { title: null, body: item.a, citations: [] } },
    followUps: null,
  };
  setFn((prev) => [...prev, userMsg, agentMsg]);
  stepTraceGeneric(setFn, agentMsg.id, steps.length);
}

function askManagerFollowUp(setFn, item) {
  // Build a richer trace for manager-initiated follow-ups that require
  // external tools when the memo doesn't already contain the answer.
  const base = ["check_memo(\"session context\")"];
  const steps = item.inMemory
    ? [...base, "Found in memo context — answering directly, no tools re-invoked"]
    : [
      ...base,
      "Not covered in memo context",
      ...(item.extraSteps && item.extraSteps.length ? item.extraSteps : [
        `search_docs("${(item.q || item.label || '').replace(/\"/g, '\\"')}")`,
        "fetch_live_market_data()",
        "run_sensitivity_and_recalc()",
      ]),
      "Synthesizing answer",
    ];

  const userMsg = { id: Date.now() + Math.random(), role: "user", text: item.q || item.label };
  const agentMsg = {
    id: Date.now() + Math.random() + 1,
    role: "agent",
    steps,
    activeIndex: 0,
    done: false,
    output: null,
    finalOutput: { type: "text", data: { title: null, body: item.a || "No data available", citations: [] } },
    followUps: null,
  };
  setFn((prev) => [...prev, userMsg, agentMsg]);
  stepTraceGeneric(setFn, agentMsg.id, steps.length);
}

function memoFreeAskInto(setFn, text) {
  const steps = ["check_memo(\"session context\")", "Not covered in memo context", "search_docs(\"related filings and transcripts\")", "Synthesizing answer"];
  const userMsg = { id: Date.now() + Math.random(), role: "user", text };
  const agentMsg = {
    id: Date.now() + Math.random() + 1,
    role: "agent",
    steps,
    activeIndex: 0,
    done: false,
    output: null,
    finalOutput: {
      type: "text",
      data: {
        title: null,
        body: "Based on the memo and underlying filings, the current evidence does not materially change once you factor that in. Flag it in committee discussion if new data emerges next quarter.",
        citations: [],
      },
    },
    followUps: null,
  };
  setFn((prev) => [...prev, userMsg, agentMsg]);
  stepTraceGeneric(setFn, agentMsg.id, steps.length);
}

/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                 */
/* ------------------------------------------------------------------ */
function TickerTape() {
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

function TopBar({ view, onBack }) {
  return (
    <div className="w-full flex items-center justify-between px-5 border-b flex-shrink-0" style={{ background: C.panel, borderColor: C.line, height: 54 }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-md" style={{ width: 28, height: 28, background: C.ink }}>
          <Building2 size={15} color="#FAF9F5" />
        </div>
        <span className="font-serif text-base tracking-wide" style={{ color: C.text }}>
          Investment Committee Copilot
        </span>
      </div>
      {(view === "analyst" || view === "manager") && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors"
          style={{ borderColor: C.line, color: C.muted }}>
          <ArrowLeft size={13} /> Switch persona
        </button>
      )}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 px-4 py-3 rounded-md border shadow-md flex items-center gap-2 z-50" style={{ background: C.panel, borderColor: C.line, color: C.text }}>
      <CheckCircle2 size={16} style={{ color: C.success }} />
      <span className="text-sm">{toast}</span>
    </div>
  );
}

function TraceList({ steps, activeIndex, done }) {
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

function ConfidencePill({ value }) {
  const tone = value >= 70 ? C.success : value >= 45 ? C.amber : C.danger;
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-md border" style={{ color: tone, borderColor: tone }}>
      {value}% confidence
    </span>
  );
}

function StatusBadge({ status, decision }) {
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

/* ------------------------------------------------------------------ */
/*  MEMO CARD                                                           */
/* ------------------------------------------------------------------ */
function MemoCard({ memo, mode, onSubmit }) {
  const [tab, setTab] = useState("summary");
  const tabs = [
    { key: "summary", label: "Summary", icon: FileText },
    { key: "financials", label: "Financials", icon: TrendingUp },
    { key: "comparison", label: "Comparison", icon: TrendingDown },
    { key: "risks", label: "Risks", icon: ShieldAlert },
    { key: "citations", label: "Citations", icon: MessageSquare },
  ];

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.line, background: C.panel }}>
      <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: C.lineSoft }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif text-lg" style={{ color: C.text }}>{memo.company}</span>
            <span className="font-mono text-xs" style={{ color: C.faint }}>{memo.ticker}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: C.teal }}>{memo.thesis}</span>
            <ConfidencePill value={memo.confidence} />
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={memo.status} decision={memo.decision} />
          <div className="text-xs mt-1" style={{ color: C.faint }}>{memo.author}</div>
        </div>
      </div>

      <div className="flex border-b overflow-x-auto" style={{ borderColor: C.lineSoft }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors"
            style={{ borderColor: tab === t.key ? C.teal : "transparent", color: tab === t.key ? C.text : C.muted }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "summary" && <p className="text-sm leading-relaxed" style={{ color: C.text }}>{memo.summary}</p>}
        {tab === "financials" && (
          <div className="grid grid-cols-2 gap-3">
            {memo.financials.map((f, i) => (
              <div key={i} className="rounded-md border px-3 py-2" style={{ borderColor: C.lineSoft }}>
                <div className="text-xs" style={{ color: C.faint }}>{f.label}</div>
                <div className="font-mono text-sm mt-0.5" style={{ color: C.text }}>{f.value}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "comparison" && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: C.faint }}>
                <th className="text-left font-normal py-1">Metric</th>
                <th className="text-left font-normal py-1">NVDA</th>
                <th className="text-left font-normal py-1">AMD</th>
                <th className="text-left font-normal py-1">INTC</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {memo.comparison.map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                  <td className="py-1.5" style={{ color: C.muted, fontFamily: "inherit" }}>{r.metric}</td>
                  <td className="py-1.5" style={{ color: C.text }}>{r.nvda}</td>
                  <td className="py-1.5" style={{ color: C.text }}>{r.amd}</td>
                  <td className="py-1.5" style={{ color: C.text }}>{r.intc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "risks" && (
          <ul className="space-y-2">
            {memo.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.text }}>
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" style={{ color: C.amber }} />
                {r}
              </li>
            ))}
          </ul>
        )}
        {tab === "citations" && (
          <div className="flex flex-wrap gap-2">
            {memo.citations.map((c, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-md border font-mono" style={{ borderColor: C.lineSoft, color: C.muted }}>{c}</span>
            ))}
          </div>
        )}
      </div>

      {mode === "analyst" && memo.status === "Pending Review" && !memo.submitted && (
        <div className="px-5 pb-5">
          <button onClick={() => onSubmit(memo.id)} className="w-full py-2.5 rounded-md text-sm font-medium transition-colors"
            style={{ background: C.teal, color: "#FAF9F5" }}>
            Submit for manager review
          </button>
        </div>
      )}
      {mode === "analyst" && memo.submitted && (
        <div className="px-5 pb-5">
          <div className="w-full py-2.5 rounded-md text-sm font-medium text-center" style={{ background: C.successDim, color: C.success }}>
            Submitted for manager review
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OUTPUT RENDERERS FOR CHAT                                           */
/* ------------------------------------------------------------------ */
function ComparisonOutput({ data }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
      <div className="font-serif text-sm mb-3" style={{ color: C.text }}>{data.title}</div>
      <table className="w-full text-sm mb-3">
        <thead>
          <tr style={{ color: C.faint }}>
            <th className="text-left font-normal py-1">Metric</th>
            <th className="text-left font-normal py-1">NVDA</th>
            <th className="text-left font-normal py-1">AMD</th>
            <th className="text-left font-normal py-1">INTC</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {data.rows.map((r, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <td className="py-1.5" style={{ color: C.muted }}>{r.metric}</td>
              <td className="py-1.5" style={{ color: C.text }}>{r.nvda}</td>
              <td className="py-1.5" style={{ color: C.text }}>{r.amd}</td>
              <td className="py-1.5" style={{ color: C.text }}>{r.intc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm" style={{ color: C.muted }}>{data.note}</p>
    </div>
  );
}

function MetricOutput({ data }) {
  const tone = data.tone === "amber" ? C.amber : C.teal;
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
      <div className="text-xs uppercase tracking-wider font-mono mb-1" style={{ color: C.faint }}>{data.label}</div>
      <div className="font-mono text-3xl mb-1" style={{ color: tone }}>{data.value}</div>
      <div className="text-xs font-mono mb-3" style={{ color: C.muted }}>{data.sub}</div>
      <p className="text-sm" style={{ color: C.text }}>{data.note}</p>
    </div>
  );
}

function TextOutput({ data }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
      {data.title && <div className="font-serif text-sm mb-2" style={{ color: C.text }}>{data.title}</div>}
      <p className="text-sm leading-relaxed mb-3" style={{ color: C.text }}>{data.body}</p>
      {data.citations && data.citations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.citations.map((c, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-md border font-mono" style={{ borderColor: C.lineSoft, color: C.muted }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DUMMY QUESTION BAR — fixed, static set, small footprint            */
/*  These are the same starter questions every time, pinned just above */
/*  the input box. They never change based on conversation state.      */
/* ------------------------------------------------------------------ */
function ChipRow({ items, onClick, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-1.5">
      <div className="text-[9px] uppercase tracking-wider font-mono mb-1" style={{ color: C.faint }}>
        {label || "Suggested"}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <button key={i} onClick={() => onClick(it)}
            className="text-[11px] leading-tight px-2 py-1 rounded-md border transition-all duration-150"
            style={{ borderColor: C.line, color: C.muted, background: C.panel, maxWidth: 300 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.muted; }}>
            {it.label || it.q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INLINE FOLLOW-UPS — rendered directly under a specific response,   */
/*  not pinned to the footer. One optional CTA (e.g. "Submit for       */
/*  manager review") is visually distinguished but stays light, never  */
/*  the dark/ink treatment used for primary nav actions.               */
/* ------------------------------------------------------------------ */
function InlineFollowUps({ items, onClick, label }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-2">
      {label && (
        <div className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: C.faint }}>
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => {
          const isCta = it.action === "submit";
          return (
            <button
              key={i}
              onClick={() => onClick(it)}
              className="text-[12.5px] leading-tight px-3 py-1.5 rounded-md border transition-all duration-150 flex items-center gap-1.5"
              style={
                isCta
                  ? { borderColor: C.teal, color: C.teal, background: C.tealDim, fontWeight: 500 }
                  : { borderColor: C.line, color: C.text, background: C.panel, maxWidth: 340 }
              }
              onMouseEnter={(e) => {
                if (isCta) { e.currentTarget.style.background = C.teal; e.currentTarget.style.color = "#FAF9F5"; }
                else { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.borderColor = C.teal; }
              }}
              onMouseLeave={(e) => {
                if (isCta) { e.currentTarget.style.background = C.tealDim; e.currentTarget.style.color = C.teal; }
                else { e.currentTarget.style.background = C.panel; e.currentTarget.style.borderColor = C.line; }
              }}
            >
              {isCta && <Send size={11} />}
              {it.label || it.q}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT PANEL (shared scaffolding)                                     */
/* ------------------------------------------------------------------ */
function ChatPanel({
  stickyHeader,
  topContent,
  topFollowUps,
  topFollowUpsLabel,
  messages,
  onInlineChipClick,
  dummyQs,
  dummyLabel,
  onDummyClick,
  onAsk,
  placeholder,
  view = "analyst",
}) {
  const [input, setInput] = useState("");
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

  return (
    <div className="flex-1 flex flex-col min-h-0 ic-chat" style={{ fontSize: chatFontSize }}>
      <style>{chatCss}</style>
      {stickyHeader}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ background: C.paper }}>
        {topContent}
        {messages.length === 0 && topFollowUps && topFollowUps.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <InlineFollowUps items={topFollowUps} onClick={onInlineChipClick} label={topFollowUpsLabel} />
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-lg px-4 py-2.5 rounded-md text-sm" style={{ background: C.ink, color: "#FAF9F5" }}>{m.text}</div>
            </div>
          ) : (
            <div key={m.id} className="max-w-2xl">
              <TraceList steps={m.steps} activeIndex={m.activeIndex} done={m.done} />
              {m.done && m.output && (
                <>
                  {m.output.type === "memo" && <MemoCard memo={m.output.data} mode="chat" />}
                  {m.output.type === "comparison" && <ComparisonOutput data={m.output.data} />}
                  {m.output.type === "metric" && <MetricOutput data={m.output.data} />}
                  {m.output.type === "text" && <TextOutput data={m.output.data} />}
                  {/* Suggested follow-ups/actions live right under this specific
                      response, not pinned to the footer. For manager view we
                      filter submit CTAs and only surface approval/rejection
                      recommendations when the memo's confidence crosses a
                      threshold. */}
                  {(() => {
                    let followUps = m.followUps ? [...m.followUps] : [];
                    if (view === "manager") {
                      followUps = followUps.filter((it) => it.action !== "submit");
                      if (m.output && m.output.type === "memo" && m.output.data) {
                        const conf = m.output.data.confidence || 0;
                        if (conf >= 75) {
                          followUps.push({ label: "Agent recommends: Approve this memo", action: "decision_recommendation", decision: "Approved" });
                        } else if (conf <= 40) {
                          followUps.push({ label: "Agent recommends: Reject this memo", action: "decision_recommendation", decision: "Rejected" });
                        }
                      }
                    }
                    return <InlineFollowUps items={followUps} onClick={onInlineChipClick} label={followUps && followUps.length ? "Follow up on this" : null} />;
                  })()}
                </>
              )}
            </div>
          )
        )}
      </div>
      <div className="px-6 pt-1 pb-3 flex-shrink-0" style={{ background: C.paper }}>
        <ChipRow items={dummyQs} onClick={onDummyClick} label={dummyLabel} />
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border" style={{ borderColor: C.line, background: C.panel }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) { onAsk(input.trim()); setInput(""); }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: C.text }}
          />
          <button
            onClick={() => { if (input.trim()) { onAsk(input.trim()); setInput(""); } }}
            className="flex-shrink-0 flex items-center justify-center rounded-md w-8 h-8 transition-colors"
            style={{ background: C.ink, color: "#FAF9F5" }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ANALYST WORKSPACE                                                   */
/* ------------------------------------------------------------------ */
function AnalystWorkspace({ submitMemo }) {
  const [messages, setMessages] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function ask(text, key) {
    askInto(setMessages, text, key);
  }

  function handleSubmitMemo(id) {
    const memo = messages.map((m) => m.output).find((o) => o && o.type === "memo" && o.data.id === id);
    if (memo) {
      submitMemo(memo.data);
      setMessages((prev) => prev.map((m) => (m.output && m.output.type === "memo" && m.output.data.id === id
        ? { ...m, output: { ...m.output, data: { ...m.output.data, submitted: true } } } : m)));
    }
  }

  // Analysts research and draft — they don't request edits on their own
  // memo. That review action belongs to the manager (see ManagerWorkspace,
  // "Request revision"), so the only memo-level action surfaced here is
  // submitting the finished draft for manager review.
  function onChipClick(item) {
    if (item.action === "submit") {
      const last = [...messages].reverse().find((m) => m.output && m.output.type === "memo");
      if (last) handleSubmitMemo(last.output.data.id);
      return;
    }
    ask(item.label, item.key);
  }

  function loadThread(t) {
    setActiveThread(t.id);
    setMessages([
      { id: 1, role: "user", text: `What's the current view on ${t.label.split(",")[0]}?` },
      {
        id: 2, role: "agent", steps: ["Retrieving prior research"], activeIndex: 1, done: true, followUps: null,
        output: { type: "text", data: { title: t.label, body: "This is a previously completed research thread, loaded from history for reference. Ask a new question below to start a fresh analysis.", citations: [] } },
      },
    ]);
  }

  return (
    <div className="flex flex-1 min-h-0">
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
            <ChevronRight size={13} style={{ transform: sidebarCollapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }} />
          </button>
          {!sidebarCollapsed && (
            <button onClick={() => { setMessages([]); setActiveThread(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ background: C.teal, color: "#FAF9F5" }}>
              <Plus size={15} /> New research
            </button>
          )}
        </div>

        {sidebarCollapsed ? (
          <div className="flex-1 flex flex-col items-center pt-2.5 gap-2">
            <button onClick={() => { setMessages([]); setActiveThread(null); }} title="New research"
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
              style={{ background: C.teal, color: "#FAF9F5" }}>
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-mono" style={{ color: C.faint }}>Recent research</div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {RECENT_THREADS.map((t) => (
                <button key={t.id} onClick={() => loadThread(t)}
                  className="w-full text-left px-2.5 py-2 rounded-md text-[13px] flex items-center justify-between"
                  style={{ background: activeThread === t.id ? C.panel : "transparent", color: C.text, border: activeThread === t.id ? `1px solid ${C.line}` : "1px solid transparent" }}>
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

      <ChatPanel
        topContent={messages.length === 0 ? (
          <div className="max-w-xl mx-auto mt-10 text-center">
            <div className="font-serif text-xl mb-1" style={{ color: C.text }}>What would you like to research?</div>
            <p className="text-sm" style={{ color: C.muted }}>Use a suggested question below, or type your own.</p>
          </div>
        ) : null}
        messages={messages}
        onInlineChipClick={onChipClick}
        dummyQs={ANALYST_CHIPS}
        view={"analyst"}
        dummyLabel="Try asking"
        onDummyClick={onChipClick}
        onAsk={(text) => ask(text, null)}
        placeholder="Ask about a company, comparison, or metric..."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MANAGER WORKSPACE                                                   */
/* ------------------------------------------------------------------ */
function ManagerWorkspace({ queue, setQueue }) {
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

/* ------------------------------------------------------------------ */
/*  LANDING PAGE                                                        */
/* ------------------------------------------------------------------ */
function LandingPage({ onEnter }) {
  const features = [
    { title: "Grounded research", body: "Every answer is backed by real filings, transcripts, and live market data, with citations attached." },
    { title: "Agentic tool use", body: "The copilot plans its own sequence of retrieval, calculation, and comparison steps based on what you ask." },
    { title: "Human in the loop", body: "Analysts draft. Managers decide. Nothing is approved or rejected without a person in the loop." },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: C.paper }}>
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-md border mb-6" style={{ borderColor: C.line, color: C.muted }}>
          Your Investment Research Assistant
        </div>
        <h1 className="font-serif text-4xl mb-4" style={{ color: C.text }}>Investment Committee Copilot</h1>
        <p className="text-base mb-10" style={{ color: C.muted }}>
          An agentic due diligence assistant that turns a single question into a fully
          researched, cited investment memo, ready for manager review.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10 text-left">
          {features.map((f, i) => (
            <div key={i} className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <div className="text-sm font-medium mb-1" style={{ color: C.teal }}>{f.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{f.body}</div>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors" style={{ background: C.ink, color: "#FAF9F5" }}>
          Enter the platform <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PERSONA SELECT                                                      */
/* ------------------------------------------------------------------ */
function PersonaSelect({ onSelect, onBack }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: C.paper }}>
      <div className="text-center mb-10 max-w-lg">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs mx-auto mb-6" style={{ color: C.faint }}>
          <ArrowLeft size={13} /> Back
        </button>
        <h1 className="font-serif text-2xl mb-3" style={{ color: C.text }}>Choose a persona</h1>
        <p className="text-sm" style={{ color: C.muted }}>See how the platform works from each side of the review process.</p>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full max-w-2xl">
        <button onClick={() => onSelect("analyst")} className="rounded-lg border p-6 text-left transition-colors" style={{ borderColor: C.line, background: C.panel }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.teal)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}>
          <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4" style={{ background: C.tealDim }}>
            <User size={20} style={{ color: C.teal }} />
          </div>
          <div className="font-serif text-lg mb-1" style={{ color: C.text }}>Investment Analyst</div>
          <p className="text-sm mb-3" style={{ color: C.muted }}>Research companies, run comparisons, and draft memos with the agent.</p>
          <span className="text-xs inline-flex items-center gap-1" style={{ color: C.teal }}>Enter as Analyst <ChevronRight size={13} /></span>
        </button>
        <button onClick={() => onSelect("manager")} className="rounded-lg border p-6 text-left transition-colors" style={{ borderColor: C.line, background: C.panel }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}>
          <div className="w-11 h-11 rounded-md flex items-center justify-center mb-4" style={{ background: C.amberDim }}>
            <Briefcase size={20} style={{ color: C.amber }} />
          </div>
          <div className="font-serif text-lg mb-1" style={{ color: C.text }}>Investment Manager</div>
          <p className="text-sm mb-3" style={{ color: C.muted }}>Review submitted memos, ask follow ups, and approve or reject.</p>
          <span className="text-xs inline-flex items-center gap-1" style={{ color: C.amber }}>Enter as Manager <ChevronRight size={13} /></span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ROOT APP                                                            */
/* ------------------------------------------------------------------ */
export default function App() {
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
