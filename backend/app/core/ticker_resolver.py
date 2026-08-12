"""
Maps user-provided company names and aliases to canonical ticker symbols.

Resolved companies are converted into ticker symbols for downstream tools.
Unknown companies are returned separately so they can be handled by
availability checks or external data providers.
"""

from rapidfuzz import fuzz, process


ALIASES = {
    "NVDA": ["nvda", "nvidia", "nvidia corp", "nvidia corporation"],
    "MSFT": ["msft", "microsoft", "microsoft corp", "microsoft corporation"],
    "AAPL": ["aapl", "apple", "apple inc", "apple inc."],
}


# Build a reverse lookup from normalized aliases to canonical tickers.

_LOOKUP = {
    alias: ticker
    for ticker, aliases in ALIASES.items()
    for alias in aliases
}


# Resolve one company name or ticker into its canonical ticker symbol.

def resolve_ticker(name: str) -> str | None:
    """Return the canonical ticker for a company name or alias."""

    normalized = name.strip().lower()

    # Fast path: resolve exact aliases without fuzzy matching.
    if normalized in _LOOKUP:
        return _LOOKUP[normalized]

    # Fallback: tolerate minor spelling mistakes without relying on the LLM.
    match = process.extractOne(
        normalized,
        _LOOKUP.keys(),
        scorer=fuzz.ratio,
    )

    if match and match[1] >= 85:
        return _LOOKUP[match[0]]

    return None


# Resolve multiple company references while separating unavailable companies.

def resolve_tickers(names: list[str]) -> tuple[list[str], list[str]]:
    """
    Resolve multiple company references into canonical tickers.

    Returns:
        A tuple containing resolved tickers and unavailable company names.
    """

    resolved = []
    unavailable = []

    # Preserve unique resolved tickers while retaining unavailable names.
    for name in names:
        ticker = resolve_ticker(name)

        if ticker and ticker not in resolved:
            resolved.append(ticker)

        if not ticker and name not in unavailable:
            unavailable.append(name)

    return resolved, unavailable