"""
Generates analytical investment memo content from RAG grounding + live market data + session chat history.

Architecture:
  LLM output  → thesis, confidence, summary, risks (analytical/synthesis only)
  Factual data → financials, comparison, citations (assembled in memo_tool.py from tools)
"""
from app.agents.llm_client import call_structured

# LLM is asked only for analytical/synthesis fields.
# Factual fields (financials, comparison, citations) are assembled by memo_tool.py
# from authoritative tool outputs — the LLM must NOT generate them.
MEMO_SCHEMA = {
    "name": "draft_investment_memo",
    "description": "Produce analytical investment memo content grounded in provided evidence",
    "input_schema": {
        "type": "object",
        "properties": {
            "thesis": {
                "type": "string",
                "description": "Investment thesis e.g. 'Long-Term Buy', 'Hold', 'Avoid'. Grounded in evidence.",
            },
            "confidence": {
                "type": "integer",
                "description": (
                    "Analytical confidence in the thesis, 0-100. "
                    "Reflect the weight and quality of the available evidence — "
                    "do not use a fixed value per company."
                ),
            },
            "summary": {
                "type": "string",
                "description": (
                    "2-4 sentence executive summary of the investment case. "
                    "Use qualitative descriptions of financial position "
                    "(e.g. 'trades at a premium to peers', 'strong margin profile'). "
                    "Do NOT state specific financial figures. "
                    "Ground every claim in the provided filing excerpts or market data."
                ),
            },
            "risks": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "Key investment risks grounded in retrieved evidence. "
                    "Do not invent company-specific facts. "
                    "Do not fabricate numerical claims. "
                    "Do not copy risk boilerplate from other companies."
                ),
            },
        },
        "required": ["thesis", "confidence", "summary", "risks"],
    },
}


def synthesize_memo(ticker: str, company: str, grounding: list[dict], market_data: dict,
                    ratios: dict, chat_history: list[dict], peer_comparison: dict) -> dict:
    """Returns only analytical fields: thesis, confidence, summary, risks.
    Factual fields are assembled separately in memo_tool.py from tool outputs.

    peer_comparison is passed as read-only context so the LLM can reason about
    relative positioning qualitatively, but must NOT reproduce the table.
    """
    grounding_text = "\n\n".join(f"[{g['citation']}]\n{g['text']}" for g in grounding)

    history_text = "\n".join(
        f"{m.get('role', 'unknown')}: {m.get('content', m.get('text', ''))}"
        for m in chat_history
    ) if chat_history else "(none)"

    user_message = f"""Company: {company} ({ticker})

RETRIEVED FILING EXCERPTS:
{grounding_text}

LIVE MARKET DATA:
{market_data}

CALCULATED RATIOS:
{ratios}

PEER COMPARISON DATA (context only — for qualitative reasoning):
{peer_comparison}

CONVERSATION HISTORY (reflect any specific angle the analyst has been probing):
{history_text}

Draft the analytical memo content now.
Rules:
- thesis and confidence must be grounded in the evidence above.
- summary must use qualitative language for financial position — do NOT state specific figures.
- risks must cite the evidence basis — do NOT invent facts or copy from other companies.
- Do NOT reproduce the peer comparison table.
- Do NOT generate financial metrics — those come from authoritative tool data."""

    return call_structured(
        system=(
            "You are an equity research assistant producing grounded analytical investment content. "
            "Your output supplies only the analytical layer: thesis, confidence, summary, and risks. "
            "Factual financial data, comparison tables, and citations are assembled separately. "
            "Never invent financial figures. Use qualitative language for valuation references. "
            "Ground every analytical claim in the supplied filing excerpts or market data. "
            "Never copy risks or analysis from one company and apply them to another."
        ),
        user_message=user_message,
        tool_schema=MEMO_SCHEMA,
    )