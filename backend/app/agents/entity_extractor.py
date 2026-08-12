"""
Node 3: Extracts companies from the user message and resolves them
into canonical ticker symbols.
"""

from app.agents.llm_client import call_structured
from app.agents.state import AgentState
from app.core.ticker_resolver import resolve_ticker, resolve_tickers


ENTITY_SCHEMA = {
    "name": "extract_entities",
    "description": "Extract companies mentioned directly or referred to indirectly "
    "in the current request.",
    "input_schema": {
        "type": "object",
        "properties": {
            "companies": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Company names or tickers mentioned by the user",
            },

            "references_resolved": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "reference": {"type": "string"},
                        "resolved_to": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                    },
                    "required": ["reference", "resolved_to"],
                },
                "description": (
                    "Conversational references resolved from recent session history."
                ),
            },
            
        },
        "required": ["companies", "references_resolved"],
    },
}


def extract_entities(message: str, session_history: list[dict]) -> tuple[list[str], list[str], list[str], list[dict]]:

    recent_history = session_history[-10:]

    history_text = "\n".join(
        f"{turn.get('role', 'unknown')}: {turn.get('content', '')}"
        for turn in recent_history
    )

    if not history_text:
        history_text = "(No previous conversation.)"

    result = call_structured(
            system=(
        "You are the entity and reference resolver for an investment "
        "research assistant.\n\n"
        
        "Extract ALL companies relevant to the CURRENT request.\n\n"
        
        "Use the recent conversation history to resolve references such as "
        "'it', 'that company', 'both', 'those two', 'the second one', "
        "'the first company', or 'the companies we discussed'.\n\n"
        
        "If the current request explicitly names companies, return them.\n"
        
        "If the current request uses a reference, resolve it using the "
        "recent conversation.\n\n"
        
        "Example:\n"
        "Previous request: comparison of Apple and Microsoft.\n"
        "Current request: 'Now create a memo for both.'\n"
        "Return companies: Apple and Microsoft.\n\n"
        
        "Do not invent companies that are not supported by the current "
        "request or recent conversation.\n\n"
        
        f"RECENT CONVERSATION:\n{history_text}"
    ),
        user_message=message,
        tool_schema=ENTITY_SCHEMA,
    )

    companies = result.get("companies", [])
    references_resolved = result.get("references_resolved", [])

    tickers, unavailable = resolve_tickers(companies)

    return companies, tickers, unavailable, references_resolved



def extract_entities_node(state: AgentState) -> AgentState:
    companies, tickers, unavailable, references_resolved = extract_entities(state["message"], state.get("session_history", []))
    
    state["tickers"] = tickers
    state["unavailable_companies"] = unavailable

    state["company_entities"] = [   
        {"name": company, "ticker": resolve_ticker(company)}
        for company in companies
    ]

    for reference in references_resolved:
        reference_text = reference.get("reference", "")
        resolved_to = reference.get("resolved_to", [])

        if resolved_to:
            state["trace_steps"] = state.get("trace_steps", []) + [
                (
                    f'Resolved reference "{reference_text}" → '
                    f'{", ".join(resolved_to)}'
                )
            ]

    state["trace_steps"] = state.get("trace_steps", []) + [
        f"Resolved tickers: {', '.join(tickers) if tickers else 'none'}",
        f"Unavailable companies: {', '.join(unavailable) if unavailable else 'none'}"
    ]

    return state