from fastapi import APIRouter
from app.memory.chat_memory import get_history, add_turn

from app.models.schemas import (
    ChatRequest, ChatResponse,
    MemoData, FinancialItem, ComparisonData, MetricData,
)
from app.agents.graph import app_graph

router = APIRouter()

@router.post("/research", response_model=ChatResponse)
def chat_research(payload: ChatRequest):
    session_id = payload.session_id

    state = {
        "role": "analyst",
        "message": payload.message,
        "session_history": get_history(session_id),
        "case_id": session_id,
        "author": "Priya Shah",
    }

    result = app_graph.invoke(state)

    response_text = ""

    final_output = result.get("final_output", {})
    output_type = final_output.get("type", "text")
    data = final_output.get("data", {})

    # Build trace from trace_steps (unchanged logic)
    trace = []
    for step in result.get("trace_steps", []):
        if isinstance(step, str):
            trace.append({
                "tool": "pipeline",
                "input": {},
                "output": {"message": step},
            })
        else:
            trace.append(step)

    assistant_text = data.get("body", "") or final_output.get("answer", "")

    add_turn(
        session_id,
        "user",
        payload.message,
    )

    add_turn(
        session_id,
        "assistant",
        assistant_text,
    )

    if output_type == "memo":
        comp = data.get("comparison", {})
        return ChatResponse(
            response_type="memo",
            trace=trace,
            memo_id=data.get("id"),
            memo=MemoData(
                id=data.get("id", ""),
                ticker=data.get("ticker", ""),
                company=data.get("company", ""),
                thesis=data.get("thesis", ""),
                confidence=data.get("confidence", 0),
                summary=data.get("summary", ""),
                financials=[
                    FinancialItem(**f)
                    for f in data.get("financials", [])
                ],
                risks=data.get("risks", []),
                citations=data.get("citations", []),
                author=data.get("author", ""),
                status=data.get("status", "Draft"),
                comparison=ComparisonData(
                    columns=comp.get("columns", []),
                    rows=comp.get("rows", []),
                ),
            ),
        )

    if output_type == "comparison":
        comp = data
        return ChatResponse(
            response_type="comparison",
            trace=trace,
            answer=final_output.get("answer", ""),
            comparison=ComparisonData(
                columns=comp.get("columns", []),
                rows=comp.get("rows", []),
            ),
        )

    if output_type == "metric":
        return ChatResponse(
            response_type="metric",
            trace=trace,
            answer=final_output.get("answer", ""),
            metric=MetricData(
                ticker=data.get("ticker", ""),
                label=data.get("label", ""),
                value=data.get("value", "n/a"),
            ),
        )

    return ChatResponse(
        response_type="text",
        trace=trace,
        answer=data.get("body", ""),
        citations=data.get("citations", []),
    )