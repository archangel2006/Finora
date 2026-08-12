"""
Tests company name -> ticker resolution.

Usage:
python -m tests.test_ticker_resolver
"""

import os
import sys

from app.core.ticker_resolver import (
    resolve_ticker,
    resolve_tickers,
)


def test_ticker_resolution():

    print("\n=== Ticker Resolver Tests ===")

    cases = [
        ("NVIDIA", "NVDA"),
        ("nvidia corporation", "NVDA"),
        ("Microsoft", "MSFT"),
        ("apple inc.", "AAPL"),
        ("nvdaa", "NVDA"),
    ]

    for company, expected in cases:

        result = resolve_ticker(company)

        print(
            f"{company} -> {result}"
        )

        assert result == expected


    multiple = resolve_tickers(
        [
            "NVIDIA",
            "Microsoft",
            "Apple",
        ]
    )

    print("\nMultiple:")
    print(multiple)

    assert multiple == [
        "NVDA",
        "MSFT",
        "AAPL",
    ]

    print("\n✅ Ticker resolver passed")


class Tee:
    def __init__(self,*files):
        self.files=files

    def write(self,data):
        for f in self.files:
            f.write(data)
            f.flush()

    def flush(self):
        for f in self.files:
            f.flush()


if __name__=="__main__":

    os.makedirs("tests",exist_ok=True)

    with open("tests/test_ticker_resolver.txt","w",encoding="utf-8") as f:

        old=sys.stdout
        sys.stdout=Tee(old,f)

        try:
            test_ticker_resolution()

        finally:
            sys.stdout=old

    print("✅ Output saved: tests/test_ticker_resolver.txt")