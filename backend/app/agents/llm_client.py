"""
Thin wrapper around Claude tool-use forcing, used to get structured JSON back
instead of free-text. Used by memo_synthesizer and the memory-check pattern.
"""
import json
import anthropic
from app.config import settings

_client = anthropic.Anthropic(
    api_key=settings.anthropic_api_key,
    base_url=settings.anthropic_base_url
)
MODEL = "claude-sonnet-4-6"


def call_structured(system: str, user_message: str, tool_schema: dict) -> dict:
    """Forces the model to respond via a single tool call matching tool_schema,
    and returns the parsed input dict."""
    response = _client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user_message}],
        tools=[tool_schema],
        tool_choice={"type": "tool", "name": tool_schema["name"]},
    )
    for block in response.content:
        if block.type == "tool_use":
            return block.input
    raise RuntimeError("Model did not return a tool_use block")