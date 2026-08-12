"""
Tool: compare_companies()
Source: live finance API (mocked) — combines market_tool + ratios_tool
"""
from app.agents.tools.market_tool import fetch_market_data
from app.agents.tools.ratios_tool import calculate_financial_ratios


def _fmt(key: str, val) -> str:
    if val is None:
        return "n/a"
    if key == "pe_ratio":
        return f"{val:.1f}x"
    if key in ("revenue_growth", "gross_margin", "roe"):
        return f"{val:.1%}"
    return str(val)


def compare_companies(tickers: list[str]) -> dict:
    tickers = [t.upper() for t in tickers]
    market = fetch_market_data(tickers)
    ratios = {t: calculate_financial_ratios(t) for t in tickers}

    metric_labels = [
        ("P/E (TTM)", "pe_ratio"), ("Revenue Growth", "revenue_growth"),
        ("Gross Margin", "gross_margin"), ("ROE", "roe"),
    ]
    rows = []
    for label, key in metric_labels:
        row = {"metric": label}
        for t in tickers:
            row[t.lower()] = _fmt(key, ratios.get(t, {}).get(key))
        rows.append(row)

    return {"tickers": tickers, "market": market, "ratios": ratios, "comparison_rows": rows}