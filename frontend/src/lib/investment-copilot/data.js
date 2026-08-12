/* ------------------------------------------------------------------ */
/*  DUMMY DOMAIN DATA                                                   */
/* ------------------------------------------------------------------ */
export const NVDA_MEMO = {
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

export const QUEUE_SEED = [
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

export const ANALYST_CHIPS = [
  { label: "Should we invest in NVIDIA for the next 5 years?", key: "nvda_thesis" },
  { label: "Compare NVIDIA and AMD", key: "compare" },
  { label: "What's AMD's current P/E vs. the sector average?", key: "amd_pe" },
  { label: "Summarize NVIDIA's latest earnings call", key: "earnings" },
];

export const MANAGER_CHIPS = [
  { label: "Request more citations", key: "req_citations" },
  { label: "Ask for sensitivity analysis (revenue/capex)", key: "sensitivity" },
  { label: "Request position sizing recommendation", key: "position_size" },
];

export const RECENT_THREADS = [
  { id: "t1", label: "TSMC, Supply Chain Risk" },
  { id: "t2", label: "Intel, Turnaround Thesis" },
  { id: "t3", label: "Broadcom, AI Networking" },
];

/* Follow-ups carry an inMemory flag: true = the manager's question is
   already covered by the current session's memo context, so we skip
   re-running research tools and answer straight from memory. false =
   genuinely new ground, so the trace shows a memory-check miss followed
   by only the extra tool(s) the answer actually needs. */
export const MEMO_FOLLOWUPS = {
  NVDA: [
    { q: "How would a decline in AI infrastructure spending affect this thesis?", inMemory: false,
      extraSteps: ["Recalculating sensitivity: capex slowdown scenario"],
      a: "A meaningful pullback in AI infrastructure capex would slow data center revenue growth and compress the current multiple, but would not change the multi-year thesis given NVIDIA's software moat and backlog visibility. Recommend revisiting position sizing rather than the thesis itself." },
    { q: "What is the customer concentration risk here?", inMemory: true,
      a: "The top four hyperscale customers account for a large share of data center revenue. A pull back from any single customer would be noticeable, though order backlogs across the group currently provide some cushion." },
    { q: "How does this compare with AMD on margins?", inMemory: true,
      a: "NVIDIA's gross margin near 75% is well above AMD's 53.6%, reflecting NVIDIA's pricing power in high end accelerators and a more mature software stack around CUDA." },
  ],
  AMD: [
    { q: "How competitive is AMD's MI300 line against NVIDIA's current generation?", inMemory: false,
      extraSteps: ["Retrieving MI300 vs. Blackwell benchmark data (RAG)"],
      a: "MI300 series accelerators are gaining design wins in select workloads, but NVIDIA still leads on software ecosystem maturity and total available performance per rack." },
    { q: "What would need to be true for this to become a buy?", inMemory: true,
      a: "A buy case would need clearer evidence of data center GPU attach rate growth and gross margin expansion toward the mid 60s, alongside continued server CPU share gains." },
    { q: "How does AMD's valuation compare with the sector?", inMemory: false,
      extraSteps: ["Fetching live sector P/E average"],
      a: "AMD trades at 112.4x trailing earnings versus a semiconductor sector average near 41.8x, pricing in AI accelerator share gains that have not yet fully shown up in reported revenue." },
  ],
  INTC: [
    { q: "Is the foundry business showing signs of improvement?", inMemory: false,
      extraSteps: ['search_docs("Intel foundry quarterly revenue trend")'],
      a: "Foundry revenue is still running below internal targets and the segment remains loss making. External customer commitments disclosed so far are limited relative to the capital being deployed." },
    { q: "What would change this from a reject to a hold?", inMemory: true,
      a: "Visible external foundry customer wins at scale, alongside a credible path to segment profitability, would be the clearest signal to revisit this position." },
    { q: "How does Intel's foundry margin compare with TSMC?", inMemory: false,
      extraSteps: ['search_docs("TSMC foundry gross margin FY2026")'],
      a: "Intel's foundry margins remain well below TSMC's, reflecting TSMC's scale advantages and more mature process yields." },
  ],
};
