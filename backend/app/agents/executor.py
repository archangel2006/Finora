"""
Executes operations produced by planner.py.

The executor contains no reasoning.
It simply dispatches each planned operation to the appropriate
application tool.
"""

from app.agents.state import AgentState

from app.agents.tools.rag_tool import search_docs
from app.agents.tools.market_tool import fetch_market_data
from app.agents.tools.ratios_tool import calculate_financial_ratios
from app.agents.tools.comparison_tool import compare_companies
from app.agents.tools.case_tool import (
    list_investment_cases,
    load_investment_case,
)
from app.agents.tools.memo_tool import (
    generate_investment_memo,
    check_memo,
)


# Execute one planned operation using the appropriate application tool.
def _execute_operation(operation: dict, state: AgentState):
    name = operation["operation"]
    args = operation.get("args", {})
    tickers = state.get("tickers", [])


    # Gather RAG documents, market data, and financial ratios for a company.
    if name == "analyze_company":
        ticker = args["ticker"]

        market = fetch_market_data([ticker])
        ratios = calculate_financial_ratios(ticker)

        documents = search_docs(
            f"{ticker} business performance strategy risks outlook",
            company=ticker,
            k=3,
        )

        return {
            "ticker": ticker,
            "documents": documents,
            "market": market.get(ticker, {}),
            "ratios": ratios,
        }


    # Compare the requested companies using the comparison tool.
    if name == "compare_companies":
        return compare_companies(args["tickers"])


    # Ask the user to specify companies when a comparison has insufficient tickers.
    if name == "insufficient_comparison":

        if tickers:
            companies = ", ".join(tickers)
            message = (
                f"Please specify the companies you'd like me to compare "
                f"with {companies}."
            )
        else:
            message = (
                "Please specify the companies you'd like me to compare."
            )

        return {"message": message}


    # Retrieve financial ratios and current market data for a company.
    if name == "financial_ratios":
        ticker = args["ticker"]

        return {
            "ticker": ticker,
            "ratios": calculate_financial_ratios(ticker),
            "market": fetch_market_data([ticker]).get(ticker, {}),
        }

    # Generate an investment memo using the resolved company and conversation context.
    if name == "generate_memo":
        ticker = args["ticker"]

        company = next(
            (
                c
                for c in state.get("company_entities", [])
                if c.get("ticker") == ticker
            ),
            {},
        )

        return generate_investment_memo(
            ticker=ticker,
            company=company.get("name", ticker),
            chat_history=state.get("session_history", []),
            author=state.get("author", "Unknown"),
        )

    # Retrieve investment cases currently waiting for manager review.
    if name == "list_pending_memos":
        return list_investment_cases(status="Pending Review")

    # Check whether the loaded memo contains enough information to answer a follow-up.
    if name == "check_memo":
        memo = state.get("memo")

        if not memo:
            return {
                "sufficient": False,
                "reason": "No memo loaded",
            }

        sufficient = check_memo(
            memo_summary=memo.get("summary", ""),
            question=state["message"],
        )

        return {
            "sufficient": sufficient,
        }

    # Return a human-action message for investment approval decisions.
    if name == "prepare_decision":
        return {
            "requires_human_action": True,
            "message": (
                "Investment decisions require manager approval "
                "through the review interface."
            ),
        }

    # Return the standard response for explicitly out-of-scope requests.
    if name == "out_of_scope":
        return {
            "message": (
                "I’m unable to assist with questions outside the "
                "supported investment research workflows."
            ),
        }

    # Report an operation that is not recognized by the executor.
    return {
        "error": f"Unknown tool operation: {name}"
    }


# Execute all operations in the planner's sequence and store their results.

def execute_tool_plan(state: AgentState) -> AgentState:
    plan = state.get("tool_plan", [])

    results = {}
    trace = state.get("trace", [])

    # Preserve the order of planned operations in the execution results.
    for index, operation in enumerate(plan):
        result = _execute_operation(operation, state)
        operation_name = operation["operation"]
        args = operation.get("args", {})

        results[f"step_{index + 1}"] = {
            "operation": operation_name,
            "result": result,
        }

        trace.append({
            "tool": operation_name,
            "input": args,
            "output": result,
        })

    state["tool_results"] = results
    state["trace"] = trace

    state["trace_steps"] = state.get("trace_steps", []) + [
        f"Executed {len(plan)} tool operation(s)"
    ]

    return state