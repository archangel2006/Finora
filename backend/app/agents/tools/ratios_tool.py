"""
Tool: calculate_financial_ratios()
Source: live finance API — MOCKED for now via mock_data/market_data.json
"""
import json
from pathlib import Path
from app.config import settings

USE_MOCK = True
MOCK_PATH = Path(settings.documents_path).parents[2] / "mock_data" / "market_data.json"


def calculate_financial_ratios(ticker: str) -> dict:
    ticker = ticker.upper()
    if USE_MOCK:
        data = json.loads(MOCK_PATH.read_text()).get(ticker, {})
        return {
            "pe_ratio": data.get("trailingPE"),
            "eps": data.get("eps"),
            "roe": data.get("roe"),
            "debt_to_equity": data.get("debtToEquity"),
            "revenue_growth": data.get("revenueGrowth"),
            "gross_margin": data.get("grossMargin"),
        }

    import yfinance as yf
    info = yf.Ticker(ticker).info
    return {
        "pe_ratio": info.get("trailingPE"), "eps": info.get("trailingEps"),
        "roe": info.get("returnOnEquity"), "debt_to_equity": info.get("debtToEquity"),
        "revenue_growth": info.get("revenueGrowth"), "gross_margin": info.get("grossMargins"),
    }