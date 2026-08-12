"""
Node 1: Determines valid intents based on the user's role.

No LLM call — role comes from the authenticated frontend session.
"""

ANALYST_INTENTS = [
    "analyze_company",
    "compare_companies",
    "metric_lookup",
    "generate_memo",
    "out_of_scope",
    "agent_capability",
    "casual_conversation", 
]


MANAGER_INTENTS = [
    "review_pending_memo",
    "ask_followup",
    "approve_reject",
    "out_of_scope",
    "agent_capability",
    "casual_conversation",
]


def get_allowed_intents(role: str) -> list[str]:
    if role == "analyst":
        return ANALYST_INTENTS

    if role == "manager":
        return MANAGER_INTENTS

    raise ValueError(f"Unknown role: {role}")


def role_router_node(state: dict) -> dict:
    state["trace_steps"] = state.get("trace_steps", []) + [
        f"Routing as {state['role']}"
    ]
    return state