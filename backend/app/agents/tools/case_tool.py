"""
Tool: load_investment_case(), list_investment_cases(), update_case_status(), create_case()
Source: app's own state — NOT RAG, NOT a finance API, never mocked in the "standing
in for something external" sense. JSON-file backed for now; swap for a real DB later
without changing any calling code (same function signatures either way).
"""
import json
from pathlib import Path
from app.config import settings

CASES_PATH = Path(settings.documents_path).parents[2] / "mock_data" / "investment_cases.json"

def _load_all() -> list[dict]:
    return json.loads(CASES_PATH.read_text())


def _save_all(cases: list[dict]):
    CASES_PATH.write_text(json.dumps(cases, indent=2))


def list_investment_cases(status: str | None = None) -> list[dict]:
    cases = _load_all()
    return [c for c in cases if c["status"] == status] if status else cases


def load_investment_case(case_id: str) -> dict | None:
    return next((c for c in _load_all() if c["id"] == case_id), None)


def create_case(case: dict) -> dict:
    cases = _load_all()
    cases.insert(0, case)
    _save_all(cases)
    return case


def update_case_status(case_id: str, status: str, decision: str | None = None) -> dict | None:
    """status: 'Draft' | 'Pending Review' | 'Decided'. decision: 'Approved' | 'Rejected' | 'Revisions Requested'."""
    cases = _load_all()
    for c in cases:
        if c["id"] == case_id:
            c["status"] = status
            if decision:
                c["decision"] = decision
            _save_all(cases)
            return c
    return None