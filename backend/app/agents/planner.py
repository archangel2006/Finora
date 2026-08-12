"""
Deterministic tool planner.

Converts classified intents + resolved tickers into executable
tool operations.

The planner does not call an LLM and does not execute tools.
"""

from app.agents.state import AgentState


def _add_plan(plan: list[dict], operation: str, **kwargs):
    plan.append({"operation": operation, "args": kwargs})


def build_tool_plan(state: AgentState) -> AgentState:
    intents = state.get("intents", [])
    tickers = state.get("tickers", [])
    plan = []

    for intent in intents:
        if intent == "analyze_company":
            for ticker in tickers:
                _add_plan(plan, "analyze_company", ticker=ticker)

        elif intent == "compare_companies":
            if len(tickers) >= 2:
                _add_plan(plan, "compare_companies", tickers=tickers)
            else:
                _add_plan(plan, "insufficient_comparison", tickers=tickers)
                
        elif intent == "metric_lookup":
            for ticker in tickers:
                _add_plan(plan, "financial_ratios", ticker=ticker)

        elif intent == "generate_memo":
            for ticker in tickers:
                _add_plan(plan, "generate_memo", ticker=ticker)

        elif intent == "review_pending_memo":
            _add_plan(plan, "list_pending_memos")

        elif intent == "ask_followup":
            _add_plan(plan, "check_memo")

        elif intent == "approve_reject":
            _add_plan(plan, "prepare_decision")

        elif intent == "out_of_scope":
            _add_plan(plan, "out_of_scope")

    state["tool_plan"] = plan
    state["trace_steps"] = state.get("trace_steps", []) + [
        f"Planned {len(plan)} tool operation(s)"
    ]

    return state