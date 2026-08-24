"""
LLM Client with Anthropic Primary + Gemini Model Fallback Cascade.

Forces structured JSON back via tool calling / schema enforcement.
Falls back automatically from Anthropic -> Gemini Models (2.5-flash -> 2.0-flash -> 1.5-flash -> 1.5-pro)
if out of credits, rate-limited, or unavailable.
"""
import json
import logging
import os
import httpx
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)

ANTHROPIC_MODEL = "claude-sonnet-4-6"

# Gemini models fallback cascade
GEMINI_MODELS_CASCADE = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]


def _call_gemini_fallback(system: str, user_message: str, tool_schema: dict) -> dict:
    """Cascade through Gemini models if Anthropic is down, out of credits, or unconfigured."""
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        raise RuntimeError(
            "Anthropic unavailable and GEMINI_API_KEY is not configured for fallback."
        )

    last_gemini_error = None

    for model_name in GEMINI_MODELS_CASCADE:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                f"System Instruction: {system}\n\n"
                                f"User Request: {user_message}\n\n"
                                f"Required Output: Respond strictly with valid JSON matching the following JSON schema:\n"
                                f"{json.dumps(tool_schema.get('parameters', {}))}\n"
                                f"Do NOT include any markdown codeblocks, explanations, or leading/trailing text outside the JSON object."
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            },
        }

        headers = {"Content-Type": "application/json"}

        try:
            logger.info("Attempting Gemini fallback model: %s", model_name)
            with httpx.Client(timeout=40.0) as http_client:
                res = http_client.post(url, json=payload, headers=headers)

            if res.status_code != 200:
                error_msg = f"HTTP {res.status_code}: {res.text}"
                logger.warning(
                    "Gemini model %s returned error: %s. Trying next model...",
                    model_name,
                    error_msg,
                )
                last_gemini_error = error_msg
                continue

            data = res.json()
            candidates = data.get("candidates", [])
            if not candidates:
                last_gemini_error = f"No candidates returned from {model_name}"
                continue

            part_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not part_text:
                last_gemini_error = f"Empty text part returned from {model_name}"
                continue

            parsed_json = json.loads(part_text)
            logger.info(
                "Successfully executed structured response via Gemini model: %s",
                model_name,
            )
            return parsed_json

        except Exception as err:
            logger.warning(
                "Gemini model %s failed with exception: %s. Trying next model...",
                model_name,
                err,
            )
            last_gemini_error = str(err)
            continue

    raise RuntimeError(
        f"All LLM providers (Anthropic & Gemini cascade) failed. Last error: {last_gemini_error}"
    )


def call_structured(system: str, user_message: str, tool_schema: dict) -> dict:
    """Forces structured JSON response.

    Tries Anthropic primary first. If Anthropic fails (quota/credits/error),
    automatically falls back to Gemini models cascade.
    """
    if settings.anthropic_api_key:
        try:
            client = anthropic.Anthropic(
                api_key=settings.anthropic_api_key,
                base_url=settings.anthropic_base_url or None,
            )
            response = client.messages.create(
                model=ANTHROPIC_MODEL,
                max_tokens=2000,
                system=system,
                messages=[{"role": "user", "content": user_message}],
                tools=[tool_schema],
                tool_choice={"type": "tool", "name": tool_schema["name"]},
            )
            for block in response.content:
                if block.type == "tool_use":
                    return block.input
            raise RuntimeError("Anthropic model did not return a tool_use block")
        except Exception as anthropic_err:
            logger.warning(
                "Primary Anthropic API call failed (%s). Initiating Gemini fallback cascade...",
                anthropic_err,
            )
    else:
        logger.info("ANTHROPIC_API_KEY not set. Directing request to Gemini fallback...")

    # Fallback to Gemini Cascade
    return _call_gemini_fallback(system, user_message, tool_schema)