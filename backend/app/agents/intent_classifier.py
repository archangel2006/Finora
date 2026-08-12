"""
Node 2: Classifies all intents present in the user's request.

The user's role determines which intents are allowed.
The LLM may return multiple intents for a single request.
"""

from app.agents.llm_client import call_structured
from app.agents.role_router import get_allowed_intents
from app.agents.state import AgentState


INTENT_DESCRIPTIONS = {
    "analyze_company":
        "Analyze company performance, risks, strategy, and outlook",
    "compare_companies":
        "Compare multiple companies using financial metrics",
    "metric_lookup":
        "Retrieve specific financial metrics or ratios",
    "generate_memo":
        "Create an investment memo or investment case",
    "review_pending_memo":
        "Review an analyst-submitted investment memo",
    "ask_followup":
        "Ask questions about an existing memo or analysis",
    "approve_reject":
        "Approve or reject an investment decision",
    "out_of_scope":
        "Request is unrelated to supported investment research workflows",
    "agent_capability": 
        "Questions about the agent, its identity, capabilities, supported companies, or how it works",
    "casual_conversation":
    "Brief greetings, gratitude, acknowledgements, confirmations, or farewells",
}


def classify_intent(state: AgentState) -> AgentState:
    allowed = get_allowed_intents(state["role"])

    intent_help = "\n".join(
        f"- {intent}: {INTENT_DESCRIPTIONS[intent]}"
        for intent in allowed
    )

    schema = {
        "name": "classify_intents",
        "description": "Identify every distinct intent in the request",
        "input_schema": {
            "type": "object",
            "properties": {
                "intents": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": allowed,
                    },
                    "description": (
                        "All intents present in the request, "
                        "ordered by task order"
                    ),
                }
            },
            "required": ["intents"],
        },
    }

    result = call_structured(
        system=f"""
Classify this investment research request.

User role: {state["role"]}

Allowed intents:
{intent_help}

Rules:

- Return every distinct intent present.
- Return each intent at most once.
- Preserve the order of the user's tasks.
- Do not invent tasks.

- Use agent_capability for questions about what the agent is,
  what it can do, or which companies it can analyze.

- Use casual_conversation ONLY for brief conversational messages
  such as "hi", "hello", "thanks", "thank you", "okay", "ok",
  "got it", "sounds good", "great", "perfect", or "bye".

- Do NOT use casual_conversation for open-ended social conversation,
  personal questions, life advice, entertainment, or general chat.
  Those should be classified as out_of_scope unless they are clearly
  related to investment research.

- Do not use casual_conversation when the user is asking an
  investment-related question, even if the message contains
  conversational language.

- Use out_of_scope only when the user's requested task itself
  is unrelated to investment research or the supported agent
  capabilities.
""",
        user_message=state["message"],
        tool_schema=schema,
    )

    raw_intents = result.get("intents", [])

    intents = []
    for intent in raw_intents:
        if intent in allowed and intent not in intents:
            intents.append(intent)

    state["intents"] = intents

    # Compatibility with the current graph.
    state["intent"] = intents[0] if intents else None

    state["trace_steps"] = state.get("trace_steps", []) + [
        f"Classified intents: {', '.join(intents) if intents else 'none'}"
    ]

    return state