"""
Generates concise user-facing responses from existing tool results.

This handles normal analyst questions.

Investment memo generation remains separate in memo_synthesizer.py.
"""

from app.agents.llm_client import call_structured


RESPONSE_SCHEMA = {
    "name": "draft_analyst_response",
    "description": "Produce a concise user-facing investment research response",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Short response title"
            },
            "body": {
                "type": "string",
                "description": (
                    "Concise answer to the user's question. "
                    "Maximum 4 short paragraphs or 6 bullets."
                )
            },
            "citations": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Source citations supporting the response"
            },
        },
        "required": ["title", "body", "citations"],
    },
}


def synthesize_response(
    question: str,
    tool_results: dict,
) -> dict:
    out_of_scope_note = None
    for step in tool_results.values():
        if step.get("operation") == "out_of_scope":
            out_of_scope_note = step.get("result", {}).get("message")
            break

    context = f"""
USER QUESTION:
{question}

TOOL RESULTS / EVIDENCE:
{tool_results}
"""

    if out_of_scope_note:
        context += f"\n\nOUT-OF-SCOPE NOTE:\n{out_of_scope_note}\n"

    return call_structured(
        system=(
            "You are an equity research assistant producing a concise "
            "user-facing answer.\n\n"

            "Use only the supplied tool results and evidence. "
            "Do not invent facts or use outside knowledge.\n\n"

            "Keep the answer concise. "
            "Do not write an essay. "
            "Use at most 4 short paragraphs or 6 bullets.\n\n"

            "Prioritize the most relevant findings for the user's question. "
            "Do not repeat all retrieved evidence.\n\n"

            "RAG documents are internal evidence. "
            "Do not reproduce the documents verbatim.\n\n"

            "If any tool result includes an operation named 'out_of_scope', "
            "that means part of the user's request is outside the supported "
            "investment research workflows. Include that warning in your answer. "
            "If possible, answer the supported investment research part of the "
            "request and explicitly say you cannot answer the unsupported portion.\n\n"

            "Only include citations that are actually present in the "
            "supplied evidence."
        ),
        user_message=context,
        tool_schema=RESPONSE_SCHEMA,
    )