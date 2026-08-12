"""
Tool: fetch_market_data()
Source: live finance API — MOCKED for now via mock_data/market_data.json
"""
import json
from pathlib import Path
from app.config import settings

USE_MOCK = True
MOCK_PATH = Path(settings.documents_path).parents[2] / "mock_data" / "market_data.json"

def _load_mock() -> dict:
    return json.loads(MOCK_PATH.read_text())


def fetch_market_data(tickers: list[str]) -> dict:
    """Returns {ticker: {price, marketCap, trailingPE, ...}}"""
    result = {}
    mock_data = _load_mock() if USE_MOCK else None

    for t in tickers:
        ticker = t.upper()
        if USE_MOCK:
            result[ticker] = mock_data.get(ticker, {"error": f"No mock data for {ticker}"})
        else:
            import yfinance as yf
            try:
                info = yf.Ticker(ticker).fast_info
                result[ticker] = {
                    "price": getattr(info, "last_price", None),
                    "marketCap": getattr(info, "market_cap", None),
                    "volume": getattr(info, "last_volume", None),
                }
            except Exception as e:
                result[ticker] = {"error": str(e)}
    return result