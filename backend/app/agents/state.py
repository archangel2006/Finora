"""
Shared state passed between LangGraph nodes.

Nodes read required fields and write their own outputs.
LangGraph manages state flow between nodes.
"""

from typing import Optional, TypedDict


class AgentState(TypedDict):
    # Input
    role: str
    message: str
    session_history: list[dict]
    case_id: Optional[str]
    author: Optional[str]

    # Intent + entities
    intents: list[str]
    intent: Optional[str]
    company_entities: list[dict]
    tickers: list[str]
    unavailable_companies: list[str]

    # Memory
    memo: Optional[dict]

    # Tool planning + execution
    tool_plan: list[dict]
    tool_results: dict

    # Final response
    final_output: Optional[dict]

    # Internal display trace
    trace_steps: list[str]

    # Structured API trace
    trace: list[dict]