"""
Tool: generate_investment_memo(), check_memo()
Synthesis tool — combines rag_tool + market_tool + ratios_tool + comparison_tool + chat history,
then assembles canonical MemoData and persists via case_tool.

Architecture:
  Tools/RAG  → factual data and evidence
  LLM        → analytical synthesis (thesis, confidence, summary, risks) only
  This file  → assembles final memo from both sources
"""
import uuid
from app.agents.memo_synthesizer import synthesize_memo
from app.agents.llm_client import call_structured
from app.agents.tools.rag_tool import search_docs
from app.agents.tools.market_tool import fetch_market_data
from app.agents.tools.ratios_tool import calculate_financial_ratios
from app.agents.tools.comparison_tool import compare_companies
from app.agents.tools.case_tool import create_case

# Fixed peer-comparison universe — intentional for current implementation scope.
# Values are always fetched dynamically from market/ratio tools.
COMPARISON_UNIVERSE = ["NVDA", "MSFT", "AAPL"]

# Maps ticker → display name for ComparisonData columns.
# compare_companies() contract (lowercase ticker keys) is NOT changed.
# Normalization happens in _normalize_comparison() here at the boundary.
DISPLAY_NAMES = {"NVDA": "NVIDIA", "MSFT": "Microsoft", "AAPL": "Apple"}

# Which financial metrics to include and how to extract them from tool output.
# Extractor lambdas read from real market/ratio tool data — never hardcoded values.
FINANCIAL_LABELS = [
    ("Price",                lambda m, r: m.get("price")),
    ("Market Cap",           lambda m, r: m.get("marketCap")),
    ("P/E (TTM)",            lambda m, r: r.get("pe_ratio")),
    ("Revenue Growth (YoY)", lambda m, r: r.get("revenue_growth")),
    ("Gross Margin",         lambda m, r: r.get("gross_margin")),
    ("ROE",                  lambda m, r: r.get("roe")),
]

SUFFICIENCY_SCHEMA = {
    "name": "grade_sufficiency",
    "description": "Decide if an existing memo already contains enough information to answer a follow-up question",
    "input_schema": {
        "type": "object",
        "properties": {"sufficient": {"type": "boolean"}, "reason": {"type": "string"}},
        "required": ["sufficient", "reason"],
    },
}


def _fmt_financial_value(label: str, raw) -> str:
    """Format a raw tool value into a display string.
    Uses explicit None check so valid zero values are not converted to 'n/a'.
    """
    if raw is None:
        return "n/a"
    if label == "Price":
        return f"${raw:,.2f}"
    if label == "Market Cap":
        return f"${raw / 1e12:.2f}T" if raw >= 1e12 else f"${raw / 1e9:.0f}B"
    if label in ("Revenue Growth (YoY)", "Gross Margin", "ROE"):
        return f"{raw:.1%}"
    if label == "P/E (TTM)":
        return f"{raw:.1f}x"
    return str(raw)


def _format_financials(market: dict, ratios: dict) -> list[dict]:
    """Build FinancialItem list from real market/ratio tool outputs.
    Never invents or hardcodes values.
    """
    return [
        {"label": label, "value": _fmt_financial_value(label, extractor(market, ratios))}
        for label, extractor in FINANCIAL_LABELS
    ]


def _normalize_comparison(raw: dict) -> dict:
    """Normalize compare_companies() raw output to ComparisonData format.

    compare_companies() returns comparison_rows with lowercase ticker keys
    e.g. {"nvda": "64.2x", "msft": "35.1x"}.
    This maps them to display names e.g. {"NVIDIA": "64.2x", "Microsoft": "35.1x"}.
    compare_companies() contract is NOT changed — normalization happens here only.
    """
    tickers = raw.get("tickers", [])
    columns = [DISPLAY_NAMES.get(t, t) for t in tickers]
    rows = []
    for row in raw.get("comparison_rows", []):
        normalized = {"metric": row["metric"]}
        for t, col in zip(tickers, columns):
            normalized[col] = row.get(t.lower(), "n/a")
        rows.append(normalized)
    return {"columns": columns, "rows": rows}


def _extract_citations(grounding: list[dict]) -> list[str]:
    """Extract unique citation strings from RAG grounding metadata.
    Citations come from actual retrieved document metadata, not LLM output.
    """
    seen = set()
    citations = []
    for doc in grounding:
        cit = doc.get("citation", "")
        if cit and cit not in seen:
            seen.add(cit)
            citations.append(cit)
    return citations


def generate_investment_memo(ticker: str, company: str, chat_history: list[dict], author: str) -> dict:
    """Generates and persists a complete investment memo.

    1. RAG retrieval    → evidence for LLM grounding
    2. market_tool      → factual market data
    3. ratios_tool      → factual financial ratios
    4. comparison_tool  → structured peer comparison (NVDA/MSFT/AAPL universe)
    5. LLM synthesis    → analytical fields only (thesis, confidence, summary, risks)
    6. Backend assembly → canonical memo combining tool data + LLM analysis
    7. create_case      → persists to investment_cases.json
    """
    # Evidence retrieval — grounds LLM analysis
    grounding = search_docs(
        f"{company} business overview risks strategy outlook",
        company=ticker,
        k=3,
    )

    # Factual tool data for the target company
    market = fetch_market_data([ticker])[ticker.upper()]
    ratios = calculate_financial_ratios(ticker)

    # Peer comparison from authoritative tool — full supported universe
    peer_comparison_raw = compare_companies(COMPARISON_UNIVERSE)

    # LLM synthesis — analytical fields only
    # LLM receives comparison as read-only context; does not reproduce it as output
    llm_content = synthesize_memo(
        ticker, company, grounding, market, ratios, chat_history, peer_comparison_raw
    )

    # Backend assembly — canonical memo from tool outputs + LLM analysis
    case = {
        "id":         str(uuid.uuid4()),
        "ticker":     ticker,
        "company":    company,
        # Analytical fields — from LLM
        "thesis":     llm_content["thesis"],
        "confidence": llm_content["confidence"],
        "summary":    llm_content["summary"],
        "risks":      llm_content["risks"],
        # Factual fields — from tools, never from LLM
        "financials": _format_financials(market, ratios),
        "comparison": _normalize_comparison(peer_comparison_raw),
        # Citations — from RAG grounding metadata
        "citations":  _extract_citations(grounding),
        # System / application values
        "author":     author,
        "status":     "Draft",
        "decision":   None,
    }
    return create_case(case)


def check_memo(memo_summary: str, question: str) -> bool:
    """Memory-check-before-tool-call: does the memo already answer this follow-up?"""
    context = f"Memo summary: {memo_summary}\n\nFollow-up question: {question}"
    result = call_structured(
        system="You decide whether an existing investment memo already contains enough "
               "information to answer a follow-up question, without pulling new market "
               "data or filings.",
        user_message=context,
        tool_schema=SUFFICIENCY_SCHEMA,
    )
    return result["sufficient"]