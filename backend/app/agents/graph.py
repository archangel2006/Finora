"""
LangGraph agent pipeline.

Connects the existing application nodes:

- Role Router
- Intent Classifier
- Entity Extractor / Ticker Resolver
- Tool Planner
- Tool Executor
- Synthesizer
"""

from langgraph import graph
from langgraph.graph import END, START, StateGraph

from app.agents.state import AgentState
from app.agents.role_router import role_router_node
from app.agents.intent_classifier import classify_intent
from app.agents.entity_extractor import extract_entities_node
from app.agents.planner import build_tool_plan
from app.agents.executor import execute_tool_plan
from app.agents.response_synthesizer import synthesize_response
from app.agents.tools.memo_tool import _normalize_comparison


# Agent capabilities node
def agent_capability_node(state: AgentState) -> AgentState:
    """Answer questions about the agent's capabilities."""

    state["final_output"] = {
        "type": "text",
        "data": {
            "title": None,
            "body": (
                "I'm an investment research copilot focused on "
                "company-level financial analysis. I can analyze "
                "NVIDIA, Microsoft, and Apple, including financial "
                "metrics, company performance, comparisons, risks, "
                "strategy, and investment-focused research. "
                "What would you like me to analyze?"
            ),
            "citations": [],
        },
    }

    state["trace_steps"] = state.get("trace_steps", []) + [
        "Agent capability request handled"
    ]

    return state

# Casual conversation node
def casual_conversation_node(state: AgentState) -> AgentState:
    """Handle brief conversational acknowledgements without using tools."""

    message = state["message"].strip().lower()

    if message in {"hi", "hello", "hey"}:
        response = "Hi! What would you like me to analyze?"

    elif message in {"thanks", "thank you", "thx"}:
        response = "You're welcome! Happy to help."

    elif message in {"okay", "ok", "got it", "sounds good", "great", "perfect"}:
        response = "Sounds good. Let me know what you'd like to analyze next."

    elif message in {"bye", "goodbye", "see you"}:
        response = "Goodbye! I'm here whenever you need investment research."

    else:
        response = "Happy to help. What would you like to analyze?"

    state["final_output"] = {
        "type": "text",
        "data": {
            "title": None,
            "body": response,
            "citations": [],
        },
    }

    state["trace_steps"] = state.get("trace_steps", []) + [
        "Casual conversation handled"
    ]

    return state


# Create the fallback response for unsupported requests.
def out_of_scope_node(state: AgentState) -> AgentState:
    """Create the fallback response for unsupported requests."""

    state["final_output"] = {
        "type": "text",
        "data": {
            "title": None,
            "body": (
                "I’m unable to assist with questions outside the "
                "supported investment research workflows."
            ),
            "citations": [],
        },
    }

    state["trace_steps"] = state.get("trace_steps", []) + [
        "Out-of-scope request handled"
    ]

    return state


# Route completely unsupported requests before entity extraction.
def route_after_intent(state: AgentState) -> str:
    """Route capability and unsupported requests."""

    intents = state.get("intents", [])

    if intents == ["agent_capability"]:
        return "agent_capability"

    if intents == ["out_of_scope"]:
        return "out_of_scope"

    if intents == ["casual_conversation"]:
        return "casual_conversation"

    return "supported"


# Route requests with no available company coverage.
def route_after_entities(state: AgentState) -> str:
    """Handle unavailable companies before planning tool operations."""

    intents = state.get("intents", [])
    tickers = state.get("tickers", [])
    unavailable = state.get("unavailable_companies", [])

    company_intents = {
        "analyze_company",
        "compare_companies",
        "metric_lookup",
        "generate_memo",
    }

    needs_company_data = any(
        intent in company_intents
        for intent in intents
    )

    if needs_company_data and unavailable:
        if tickers:
            return "mixed_company"
        return "unsupported_company"

    return "supported"



# Create a user-facing response when requested companies are unavailable.
def unsupported_company_node(state: AgentState) -> AgentState:
    """Explain unavailable company coverage and suggest supported alternatives."""

    unavailable = ", ".join(state.get("unavailable_companies", []))

    state["final_output"] = {
        "type": "text",
        "data": {
            "title": None,
            "body": (
                f"I don't currently have data for {unavailable}. "
                "I currently have coverage for NVIDIA, Microsoft, and Apple. "
                "Would you like to know more about one of those instead?"
            ),
            "citations": [],
        },
    }

    state["trace_steps"] = state.get("trace_steps", []) + [
        "Unsupported company request handled"
    ]

    return state

# Create a response when some requested companies are supported and others are unavailable.
def mixed_company_node(state: AgentState) -> AgentState:
    unavailable = ", ".join(state.get("unavailable_companies", []))

    state["final_output"] = {
        "type": "text",
        "data": {
            "title": None,
            "body": (
                f"I don't currently have data for {unavailable}, "
                "so I can't complete this request as asked. "
                "I currently have coverage for NVIDIA, Microsoft, and Apple. "
                "Would you like to continue with the available company data?"
            ),
            "citations": [],
        },
    }

    state["trace_steps"] = state.get("trace_steps", []) + [
        "Mixed supported and unsupported company request handled"
    ]

    return state


# Convert executed operations into frontend-friendly trace steps.
def build_tool_trace(state: AgentState) -> list[dict]:
    trace = []

    for step in state.get("tool_results", {}).values():
        operation = step.get("operation", "")
        result = step.get("result", {})

        if operation == "analyze_company":
            ticker = result.get("ticker", "")
            trace.append({
                "tool": "fetch_market_data",
                "input": {"ticker": ticker},
                "output": result.get("market", {}),
            })
            trace.append({
                "tool": "calculate_financial_ratios",
                "input": {"ticker": ticker},
                "output": result.get("ratios", {}),
            })
            trace.append({
                "tool": "search_docs",
                "input": {"ticker": ticker},
                "output": result.get("documents", []),
            })

        elif operation == "financial_ratios":
            ticker = result.get("ticker", "")
            trace.append({
                "tool": "calculate_financial_ratios",
                "input": {"ticker": ticker},
                "output": result.get("ratios", {}),
            })
            trace.append({
                "tool": "fetch_market_data",
                "input": {"ticker": ticker},
                "output": result.get("market", {}),
            })

        elif operation == "compare_companies":
            trace.append({
                "tool": "compare_companies",
                "input": {
                    "tickers": state.get("tickers", [])
                },
                "output": result,
            })

        elif operation == "search_docs":
            trace.append({
                "tool": "search_docs",
                "input": {},
                "output": result,
            })

        elif operation:
            trace.append({
                "tool": operation,
                "input": {},
                "output": result,
            })

    return trace


# Generate the final user-facing response and preserve tool-level trace data.
def response_synthesizer_node(state: AgentState) -> AgentState:
    tool_results = state.get("tool_results", {})

    # Detect which operations ran — using verified executor structure:
    # tool_results = {"step_1": {"operation": "...", "result": {...}}, ...}
    operations = {v.get("operation") for v in tool_results.values()}

    if "generate_memo" in operations:
        # memo_tool already assembled the complete canonical memo — use directly
        memo_result = next(
            v["result"] for v in tool_results.values()
            if v.get("operation") == "generate_memo"
        )
        state["final_output"] = {"type": "memo", "data": memo_result}

    elif "compare_companies" in operations:
        compare_raw = next(
            v["result"] for v in tool_results.values()
            if v.get("operation") == "compare_companies"
        )
        # Normalize comparison for standalone compare queries (same as memo path)
        normalized = _normalize_comparison(compare_raw)
        explanation = synthesize_response(
            question=state["message"],
            tool_results=tool_results,
        ).get("body", "")
        state["final_output"] = {
            "type": "comparison",
            "data": normalized,
            "answer": explanation,
        }

    elif "financial_ratios" in operations:
        # Verified shape: {"ticker": "...", "ratios": {...}, "market": {...}}
        ratios_result = next(
            v["result"] for v in tool_results.values()
            if v.get("operation") == "financial_ratios"
        )
        ticker = ratios_result.get("ticker", "")
        ratios = ratios_result.get("ratios", {})
        pe = ratios.get("pe_ratio")
        # Explicit None check — preserves valid zero values
        pe_str = f"{pe:.1f}x" if pe is not None else "n/a"
        explanation = synthesize_response(
            question=state["message"],
            tool_results=tool_results,
        ).get("body", "")
        state["final_output"] = {
            "type": "metric",
            "data": {
                "ticker": ticker,
                "label": f"{ticker} Key Metrics",
                "value": pe_str,
                "ratios": ratios,
                "market": ratios_result.get("market", {}),
            },
            "answer": explanation,
        }

    else:
        # General Q&A — existing LLM text synthesis path, unchanged
        response = synthesize_response(
            question=state["message"],
            tool_results=tool_results,
        )
        state["final_output"] = {"type": "text", "data": response}

    # Keep the high-level pipeline trace, then append actual tool execution steps.
    state["trace_steps"] = state.get("trace_steps", []) + build_tool_trace(state)
    state["trace_steps"] = state.get("trace_steps", []) + [
        "Generated final user-facing response"
    ]

    return state

# Build and compile the LangGraph workflow.
def build_graph():
    """Build and compile the LangGraph agent pipeline."""

    graph = StateGraph(AgentState)

    # Register Application nodes
    graph.add_node("casual_conversation", casual_conversation_node)
    graph.add_node("agent_capability", agent_capability_node)
    graph.add_node("role_router", role_router_node)
    graph.add_node("intent_classifier", classify_intent)
    graph.add_node("entity_extractor", extract_entities_node)
    graph.add_node("planner", build_tool_plan)
    graph.add_node("executor", execute_tool_plan)
    graph.add_node("response_synthesizer", response_synthesizer_node)


    # Register Fallback node
    graph.add_node("out_of_scope", out_of_scope_node)
    graph.add_node("unsupported_company", unsupported_company_node)
    graph.add_node("mixed_company", mixed_company_node)

    # Main pipeline
    graph.add_edge(START, "role_router")
    graph.add_edge("role_router", "intent_classifier")


    # Intent-based routing
    graph.add_conditional_edges(
        "intent_classifier",
        route_after_intent,
        {
            "agent_capability": "agent_capability",
            "casual_conversation": "casual_conversation",
            "supported": "entity_extractor",
            "out_of_scope": "out_of_scope",
        },
    )

    # Route unavailable-company requests before tool planning.
    graph.add_conditional_edges(
        "entity_extractor",
        route_after_entities,
        {
            "supported": "planner",
            "unsupported_company": "unsupported_company",
            "mixed_company": "mixed_company",
        },
    )

    # Execute the planned operations and finish the analyst workflow.
    graph.add_edge("planner", "executor")
    graph.add_edge("executor", "response_synthesizer")
    graph.add_edge("response_synthesizer", END)

    graph.add_edge("casual_conversation", END)
    graph.add_edge("agent_capability", END)
    graph.add_edge("unsupported_company", END)
    graph.add_edge("out_of_scope", END)
    graph.add_edge("mixed_company", END)

    return graph.compile()


app_graph = build_graph()