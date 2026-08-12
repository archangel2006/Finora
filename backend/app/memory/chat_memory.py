"""
Lightweight session-based conversation memory.

Stores recent conversation turns by session_id.
This is intentionally session-scoped and in-memory.
It is not long-term or semantic memory.
"""

from collections import defaultdict
from typing import Optional


_MAX_TURNS = 10

_sessions: dict[str, list[dict]] = defaultdict(list)


def get_history(session_id: Optional[str]) -> list[dict]:
    """Return recent conversation history for a session."""
    if not session_id:
        return []

    return list(_sessions.get(session_id, []))


def add_turn(
    session_id: Optional[str],
    role: str,
    content: str,
) -> None:
    """Store one conversation turn for a session."""
    if not session_id:
        return

    _sessions[session_id].append({
        "role": role,
        "content": content,
    })

    # Keep only the most recent turns.
    _sessions[session_id] = _sessions[session_id][-_MAX_TURNS:]


def clear_session(session_id: Optional[str]) -> None:
    """Clear all conversation history for a session."""
    if session_id:
        _sessions.pop(session_id, None)