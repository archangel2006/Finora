/* ------------------------------------------------------------------ */
/*  API SERVICE & RESPONSE PARSER FOR INVESTMENT COPILOT                */
/* ------------------------------------------------------------------ */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Company name resolution lookup
const COMPANY_NAMES = {
  NVDA: "NVIDIA Corporation",
  AMD: "Advanced Micro Devices",
  INTC: "Intel Corporation",
  TSM: "Taiwan Semiconductor Mfg.",
  MSFT: "Microsoft Corporation",
  AAPL: "Apple Inc.",
  GOOGL: "Alphabet Inc.",
  TSLA: "Tesla, Inc.",
  AVGO: "Broadcom Inc.",
};

/**
 * Send an analyst message to the FastAPI backend
 */
export async function sendAnalystMessage(message, sessionId = "default", memoId = null) {
  const res = await fetch(`${BASE_URL}/chat/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      memo_id: memoId,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Backend error:", detail);
    throw new Error(`Request failed (${res.status}). Please try again.`);
  }

  return res.json();
}

/**
 * Generate candidate live execution status steps based on user query
 * Used to advance real-time status indicator smoothly while HTTP request is pending.
 */
export function generateLiveSteps(userQuery) {
  const q = (userQuery || "").toLowerCase();

  // Extract company name if present
  let companyMention = "";
  if (q.includes("nvidia") || q.includes("nvda")) companyMention = "NVIDIA";
  else if (q.includes("amd")) companyMention = "AMD";
  else if (q.includes("intel") || q.includes("intc")) companyMention = "Intel";
  else if (q.includes("microsoft") || q.includes("msft")) companyMention = "Microsoft";
  else if (q.includes("apple") || q.includes("aapl")) companyMention = "Apple";
  else if (q.includes("tesla") || q.includes("tsla")) companyMention = "Tesla";

  // Comparison query
  if (q.includes("compare") || q.includes(" vs")) {
    return [
      "Classifying intent...",
      companyMention ? `Identifying ${companyMention} & peer group...` : "Identifying companies...",
      "Planning comparative research...",
      "Fetching market data for peer group...",
      "Calculating comparative financial ratios...",
      "Generating comparison matrix...",
      "Preparing response...",
    ];
  }

  // Ratios / Metric lookup query
  if (q.includes("ratio") || q.includes("p/e") || q.includes("margin") || q.includes("eps") || q.includes("valuation")) {
    return [
      "Classifying intent...",
      companyMention ? `Identifying ${companyMention}...` : "Identifying company...",
      "Fetching live market metrics...",
      "Calculating valuation and profitability ratios...",
      "Preparing financial analysis...",
    ];
  }

  // Deep dive / General analysis query
  if (q.includes("analyze") || q.includes("invest") || q.includes("doing") || q.includes("memo") || q.includes("thesis")) {
    return [
      "Classifying intent...",
      companyMention ? `Identifying ${companyMention}...` : "Identifying target company...",
      "Planning research pipeline...",
      "Fetching live market data...",
      "Calculating financial ratios...",
      "Searching research documents...",
      "Synthesizing investment thesis...",
      "Preparing response...",
    ];
  }

  // Out of scope / simple query
  if (q.includes("poem") || q.includes("hello") || q.includes("joke") || q.includes("weather")) {
    return [
      "Classifying intent...",
      "Preparing response...",
    ];
  }

  // Default natural pipeline steps
  return [
    "Classifying intent...",
    companyMention ? `Identifying ${companyMention}...` : "Identifying query context...",
    "Searching research data...",
    "Preparing response...",
  ];
}

/**
 * Format the real backend trace into clean human-readable steps.
 * Reads whatever the backend actually executed — no hardcoding or query keyword inference.
 * Each item in rawTrace has: { tool: string, input: {}, output: {} }
 */
export function formatCompletedTrace(rawTrace) {
  if (!rawTrace || !Array.isArray(rawTrace) || rawTrace.length === 0) {
    return [];
  }

  // Map backend tool names → clean display labels
  const TOOL_LABELS = {
    classify_intent:           "Classifying intent",
    extract_entities:          "Extracting company / ticker",
    entity_extractor:          "Extracting company / ticker",
    build_tool_plan:           "Planning research steps",
    planner:                   "Planning research steps",
    fetch_market_data:         "Fetching live market data",
    calculate_financial_ratios:"Calculating valuation and profitability ratios",
    search_docs:               "Retrieving 10-K, 10-Q and earnings transcripts (RAG)",
    compare_companies:         "Comparing sector peers",
    synthesize_memo:           "Drafting investment memo",
    generate_investment_memo:  "Drafting investment memo",
    generate_memo:             "Drafting investment memo",
    synthesize_response:       "Synthesizing research response",
    response_synthesizer:      "Synthesizing research response",
    // pipeline = string trace_steps the backend appended as text
    pipeline:                  null,
  };

  const steps = [];
  const seen = new Set();

  for (const item of rawTrace) {
    const tool = item.tool || "";

    // pipeline entries are raw string messages from the backend
    if (tool === "pipeline") {
      const msg = item.output?.message;
      if (msg && !seen.has(msg)) {
        steps.push(msg);
        seen.add(msg);
      }
      continue;
    }

    // For known tools, use the label; for unknown tools, humanize the key
    const label =
      tool in TOOL_LABELS
        ? TOOL_LABELS[tool]
        : tool.replace(/_/g, " ");

    // Enrich intent label with the actual intent value returned by the backend
    let displayLabel = label;
    if (tool === "classify_intent") {
      const intentVal =
        typeof item.output === "string"
          ? item.output
          : item.output?.intent || item.output?.message || "";
      if (intentVal) {
        displayLabel = `Classifying intent: ${intentVal.replace(/_/g, " ")}`;
      }
    }

    if (displayLabel && !seen.has(displayLabel)) {
      steps.push(displayLabel);
      seen.add(displayLabel);
    }
  }

  return steps;
}

function extractTickerFromBackendResponse(backendRes) {
  if (backendRes?.memo?.ticker) return backendRes.memo.ticker;
  if (backendRes?.metric?.ticker) return backendRes.metric.ticker;
  if (Array.isArray(backendRes?.trace)) {
    for (const step of backendRes.trace) {
      if (step.input?.ticker) return step.input.ticker;
      if (Array.isArray(step.input?.tickers) && step.input.tickers[0]) return step.input.tickers[0];
      if (step.output?.ticker) return step.output.ticker;
    }
  }
  const text = (backendRes?.answer || "") + (backendRes?.memo?.company || "");
  const lower = text.toLowerCase();
  if (lower.includes("nvidia") || lower.includes("nvda")) return "NVDA";
  if (lower.includes("microsoft") || lower.includes("msft")) return "MSFT";
  if (lower.includes("apple") || lower.includes("aapl")) return "AAPL";
  return "";
}

/**
 * Thin adapter: reads response_type from backend and maps to Investment Copilot
 * output types. Never manufactures investment data — backend is the sole source.
 * Generates 2-3 contextual follow-up chips strictly on the frontend.
 */
export function parseBackendResponse(backendRes) {
  const type = backendRes?.response_type || "text";
  const ticker = extractTickerFromBackendResponse(backendRes);
  const suggestedFollowups = generateContextualFollowUps(type, ticker, backendRes?.answer || "");

  if (type === "memo" && backendRes.memo) {
    const m = backendRes.memo;
    return {
      type: "memo",
      data: {
        id: backendRes.memo_id,
        ticker: m.ticker,
        company: m.company,
        thesis: m.thesis,
        confidence: m.confidence,
        summary: m.summary,
        financials: m.financials || [],    // [{label, value}] from tools
        risks: m.risks || [],              // LLM analytical output
        citations: m.citations || [],      // from RAG metadata
        author: m.author || "",
        status: m.status || "Draft",
        comparison: m.comparison || null,  // {columns, rows} from compare_companies()
        suggestedFollowups: suggestedFollowups,
      },
    };
  }

  if (type === "comparison" && backendRes.comparison) {
    return {
      type: "comparison",
      data: {
        title: backendRes.comparison.columns.join(" vs. "),
        columns: backendRes.comparison.columns,
        rows: backendRes.comparison.rows,
        note: backendRes.answer || "",
        suggestedFollowups: suggestedFollowups,
      },
    };
  }

  if (type === "metric" && backendRes.metric) {
    return {
      type: "metric",
      data: {
        label: backendRes.metric.label,
        value: backendRes.metric.value,
        sub: backendRes.metric.sub || null,
        tone: backendRes.metric.tone || "teal",
        note: backendRes.answer || "",
        citations: backendRes.citations || [],
        suggestedFollowups: suggestedFollowups,
      },
    };
  }

  // text / unsupported company / out-of-scope / unrecognized type
  return {
    type: "text",
    data: {
      title: null,
      body: backendRes?.answer || "",
      citations: backendRes?.citations || [],
      suggestedFollowups: suggestedFollowups,
    },
  };
}

export function generateContextualFollowUps(intent, ticker, userQuery) {
  const q = (userQuery || "").toLowerCase();
  const followUps = [];

  // Detect target ticker from parameter or query text
  let targetTicker = ticker;
  if (!targetTicker) {
    if (q.includes("apple") || q.includes("aapl")) targetTicker = "AAPL";
    else if (q.includes("microsoft") || q.includes("msft")) targetTicker = "MSFT";
    else if (q.includes("nvidia") || q.includes("nvda")) targetTicker = "NVDA";
  }

  if (targetTicker === "AAPL") {
    followUps.push("Summarize Apple's latest earnings call");
    followUps.push("What are Apple's main growth drivers and key risk factors?");
    followUps.push("Compare Apple and Microsoft");
  } else if (targetTicker === "MSFT") {
    followUps.push("Summarize Microsoft's latest earnings call");
    followUps.push("How is Azure AI revenue growing for Microsoft?");
    followUps.push("Compare Microsoft and NVIDIA");
  } else if (targetTicker === "NVDA") {
    followUps.push("Should we invest in NVIDIA for the next 5 years?");
    followUps.push("Summarize NVIDIA's latest earnings call");
    followUps.push("Compare NVIDIA and Microsoft");
  } else if (q.includes("compare") || q.includes(" vs") || intent === "comparison" || intent === "compare_companies") {
    followUps.push("Compare NVIDIA, Apple, and Microsoft");
    followUps.push("Should we invest in NVIDIA for the next 5 years?");
    followUps.push("Summarize Apple's latest earnings call");
  } else {
    // Default fallback strictly within NVDA, AAPL, and MSFT scope
    followUps.push("Should we invest in NVIDIA for the next 5 years?");
    followUps.push("Summarize Apple's latest earnings call");
    followUps.push("Compare Microsoft and NVIDIA");
  }

  return followUps.slice(0, 3);
}

// Utility to clean raw backend python dict strings if present
function cleanAnswerText(raw) {
  if (!raw) return "";

  // If answer is stringified python dict like "{'docs': [...]}", format cleanly
  if (raw.startsWith("{") && raw.endsWith("}")) {
    try {
      const cleanedStr = raw.replace(/'/g, '"');
      const parsed = JSON.parse(cleanedStr);
      if (parsed.summary) return parsed.summary;
      if (parsed.answer) return parsed.answer;
      if (parsed.note) return parsed.note;
    } catch (e) {
      // Not valid JSON, strip bracket wrappers if raw text
    }
  }

  return raw;
}

export function sanitizeMemoSummary(text) {
  if (!text) return { body: "", note: "" };

  const bodyParagraphs = [];
  const noteParagraphs = [];

  const paragraphs = text.split(/\n\s*\n/);

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    const isDisclaimer =
      trimmed.startsWith("---") ||
      trimmed.startsWith("⚠️") ||
      /outside (my|supported) (coverage universe|investment research)/i.test(trimmed) ||
      /joke/i.test(trimmed) ||
      /different analyst/i.test(trimmed) ||
      /keeping the memo professional/i.test(trimmed);

    if (isDisclaimer) {
      noteParagraphs.push(trimmed.replace(/^---\s*/, ""));
    } else {
      bodyParagraphs.push(trimmed);
    }
  }

  return {
    body: bodyParagraphs.join("\n\n").trim(),
    note: noteParagraphs.join("\n\n").trim(),
  };
}