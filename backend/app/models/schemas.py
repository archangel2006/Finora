from pydantic import BaseModel
from typing import Optional, List, Any

# schema: request body for a chat / research question

class ChatRequest(BaseModel):
    session_id: str
    message: str
    memo_id: str | None = None

# schema: a single step in the agent's tool-call trace

class TraceStep(BaseModel):
    tool: str
    input: dict
    output: Optional[Any] = None

# schema: a single financial metric row in a memo
class FinancialItem(BaseModel):
    label: str
    value: str

# schema: peer comparison table (columns + rows)
class ComparisonData(BaseModel):
    columns: List[str]   # e.g. ["NVIDIA", "Microsoft", "Apple"]
    rows: List[dict]     # e.g. [{"metric": "P/E (TTM)", "NVIDIA": "64.2x", ...}]

# schema: complete structured investment memo
class MemoData(BaseModel):
    id: str
    ticker: str
    company: str
    thesis: str                      # LLM analytical output
    confidence: int                  # LLM analytical output (0-100)
    summary: str                     # LLM analytical output (qualitative)
    financials: List[FinancialItem]  # from market + ratio tools
    risks: List[str]                 # LLM analytical output grounded in RAG evidence
    citations: List[str]             # from RAG grounding metadata
    comparison: ComparisonData       # from compare_companies() tool
    author: str                      # system value
    status: str                      # system value: "Draft"

# schema: structured metric lookup result
class MetricData(BaseModel):
    ticker: str
    label: str
    value: str
    sub: Optional[str] = None
    tone: Optional[str] = "teal"

# schema: full agent response returned to the frontend
# Extended non-destructively — existing fields and defaults preserved.
# New fields are all Optional with None defaults for backward compatibility.
class ChatResponse(BaseModel):
    # Existing fields — unchanged
    trace: List[TraceStep]
    answer: str = ""
    memo_id: Optional[str] = None
    citations: List[str] = []
    # New fields — all optional, default None
    response_type: str = "text"          # "memo" | "comparison" | "metric" | "text"
    memo: Optional[MemoData] = None
    comparison: Optional[ComparisonData] = None
    metric: Optional[MetricData] = None

# schema: manager decision payload

class DecisionRequest(BaseModel):
    decision: str
    note: Optional[str] = None