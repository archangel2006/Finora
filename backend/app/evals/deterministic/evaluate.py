"""
Deterministic evaluator for the Investment Research Copilot.

Evaluates the real LangGraph pipeline on the golden dataset.

Dimensions:
1. Intent classification
2. Ticker/entity resolution
3. Unavailable-company detection
4. Tool planning

Each dimension is scored from 0.0 to 5.0.

The evaluator intentionally supports partial credit:
- Multiple intents are matched independently.
- Multiple tickers are matched independently.
- Multiple unavailable companies are matched independently.
- Planner operations are matched one-to-one.
- Missing or extra items reduce the score rather than forcing a zero.

All scores are normalized to a 0.0-5.0 scale and rounded
to one decimal place.

The evaluator does NOT evaluate the final LLM-generated response.
That belongs in the separate GE/evaluation layer.
"""

import json
import os
from collections import Counter
from typing import Any

from app.agents.graph import app_graph


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(__file__)

GOLDEN_PATH = os.path.join(
    BASE_DIR,
    "golden_dataset.json",
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "evaluation_results.json",
)

MAX_SCORE = 5.0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def round_score(value: float) -> float:
    """Round all evaluator scores to one decimal place."""
    return round(
        max(0.0, min(value, MAX_SCORE)),
        1,
    )


def normalize_list(values: list[Any] | None) -> list[str]:
    """
    Normalize list values for comparison.

    Ordering is ignored because intents, tickers, and unavailable
    companies are evaluated as sets.
    """

    if not values:
        return []

    return [
        str(value).strip().lower()
        for value in values
        if value is not None
    ]


def unique(values: list[str]) -> list[str]:
    """Remove duplicates while preserving first-seen order."""
    return list(dict.fromkeys(values))


def set_match_score(
    expected: list[str],
    actual: list[str],
) -> tuple[float, dict]:
    """
    Generic set-based scorer using precision and recall.

    This is used for:
        - intents
        - tickers
        - unavailable companies

    Exact match:
        5.0

    Partial match:
        partial credit

    Missing expected values:
        penalized through recall

    Extra predicted values:
        penalized through precision
    """

    expected = unique(normalize_list(expected))
    actual = unique(normalize_list(actual))

    expected_set = set(expected)
    actual_set = set(actual)

    # Both correctly empty.
    if not expected_set and not actual_set:
        return 5.0, {
            "expected": expected,
            "actual": actual,
            "matched": [],
            "missing": [],
            "extra": [],
            "precision": 1.0,
            "recall": 1.0,
        }

    matched = sorted(expected_set & actual_set)
    missing = sorted(expected_set - actual_set)
    extra = sorted(actual_set - expected_set)

    recall = (
        len(matched) / len(expected_set)
        if expected_set
        else 1.0
    )

    precision = (
        len(matched) / len(actual_set)
        if actual_set
        else 0.0
    )

    if precision + recall == 0:
        f1 = 0.0
    else:
        f1 = (
            2 * precision * recall
            / (precision + recall)
        )

    score = f1 * MAX_SCORE

    return round_score(score), {
        "expected": expected,
        "actual": actual,
        "matched": matched,
        "missing": missing,
        "extra": extra,
        "precision": round(precision, 1),
        "recall": round(recall, 1),
    }


# ---------------------------------------------------------------------------
# Intent scoring
# ---------------------------------------------------------------------------

def score_intents(
    expected: list[str],
    actual: list[str],
) -> tuple[float, dict]:
    """
    Score intent classification from 0.0 to 5.0.

    Multiple intents are supported.

    Examples:

        expected = ["metric_lookup"]
        actual   = ["metric_lookup"]
        -> 5.0

        expected = ["metric_lookup", "compare_companies"]
        actual   = ["metric_lookup"]
        -> partial credit

        expected = ["metric_lookup"]
        actual   = ["metric_lookup", "generate_memo"]
        -> partial credit with extra-intent penalty
    """

    return set_match_score(
        expected,
        actual,
    )


# ---------------------------------------------------------------------------
# Ticker scoring
# ---------------------------------------------------------------------------

def score_tickers(
    expected: list[str],
    actual: list[str],
) -> tuple[float, dict]:
    """
    Score ticker/entity resolution from 0.0 to 5.0.

    Multiple tickers are supported.

    Ordering does not matter.
    """

    return set_match_score(
        expected,
        actual,
    )


# ---------------------------------------------------------------------------
# Unavailable-company scoring
# ---------------------------------------------------------------------------

def score_unavailable_companies(
    expected: list[str],
    actual: list[str],
) -> tuple[float, dict]:
    """
    Score unavailable-company detection from 0.0 to 5.0.

    This is important for cases such as:

        Expected:
            ["Tesla"]

        Actual:
            ["Tesla"]

        -> 5.0

    If the evaluator misses an unavailable company, recall decreases.

    If the pipeline incorrectly marks a supported company as unavailable,
    precision decreases.
    """

    return set_match_score(
        expected,
        actual,
    )


# ---------------------------------------------------------------------------
# Planner scoring
# ---------------------------------------------------------------------------

def normalize_operation(operation: dict) -> tuple:
    """
    Convert a planner operation into a comparable representation.
    """

    if not isinstance(operation, dict):
        return ("", ())

    name = str(
        operation.get("operation", "")
    ).strip().lower()

    args = operation.get(
        "args",
        {},
    ) or {}

    normalized_args = []

    for key in sorted(args.keys()):
        value = args[key]

        if isinstance(value, list):
            value = tuple(
                str(item).strip().upper()
                for item in value
            )

        elif isinstance(value, str):
            value = value.strip().upper()

        normalized_args.append(
            (key, value)
        )

    return name, tuple(normalized_args)


def operation_similarity(
    expected_operation: dict,
    actual_operation: dict,
) -> float:
    """
    Return planner-operation similarity from 0.0 to 1.0.

    Scoring:

        Correct operation name -> 60%

        Correct arguments     -> 40%

    For list arguments such as tickers, partial overlap receives
    partial argument credit.
    """

    expected_name, expected_args = normalize_operation(
        expected_operation
    )

    actual_name, actual_args = normalize_operation(
        actual_operation
    )

    # Different operation = no match.
    if not expected_name:
        return 0.0

    if expected_name != actual_name:
        return 0.0

    expected_dict = dict(expected_args)
    actual_dict = dict(actual_args)

    # Both operations have no arguments.
    if not expected_dict and not actual_dict:
        return 1.0

    # Expected has no arguments but actual does.
    if not expected_dict:
        return 0.75

    # Expected has arguments but actual does not.
    if not actual_dict:
        return 0.25

    matched_args = 0.0

    for key, expected_value in expected_dict.items():

        if key not in actual_dict:
            continue

        actual_value = actual_dict[key]

        # Exact argument match.
        if expected_value == actual_value:
            matched_args += 1.0
            continue

        # Partial credit for list arguments.
        if (
            isinstance(expected_value, tuple)
            and isinstance(actual_value, tuple)
        ):
            expected_set = set(expected_value)
            actual_set = set(actual_value)

            if expected_set:
                overlap = len(
                    expected_set & actual_set
                )

                matched_args += (
                    overlap / len(expected_set)
                )

    argument_score = (
        matched_args / len(expected_dict)
    )

    return (
        0.60
        + (0.40 * argument_score)
    )


def score_planner(
    expected_plan: list[dict],
    actual_plan: list[dict],
) -> tuple[float, dict]:
    """
    Score planner output from 0.0 to 5.0.

    Matching is one-to-one.

    Example:

        Expected:
            A, B, C

        Actual:
            A, B

    A and B receive credit.
    C is counted as missing.

    Likewise:

        Expected:
            A, B

        Actual:
            A, B, C

    A and B receive credit.
    C is counted as an extra operation.
    """

    expected_plan = expected_plan or []
    actual_plan = actual_plan or []

    # Both correctly empty.
    if not expected_plan and not actual_plan:
        return 5.0, {
            "expected": [],
            "actual": [],
            "matched": [],
            "missing": [],
            "extra": [],
            "coverage": 1.0,
            "extra_penalty": 0.0,
        }

    used_actual = set()
    matches = []

    # Match every expected operation with the best unused
    # actual operation.
    for expected_index, expected_operation in enumerate(
        expected_plan
    ):

        best_index = None
        best_similarity = 0.0

        for actual_index, actual_operation in enumerate(
            actual_plan
        ):

            if actual_index in used_actual:
                continue

            similarity = operation_similarity(
                expected_operation,
                actual_operation,
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_index = actual_index

        if (
            best_index is not None
            and best_similarity > 0
        ):
            used_actual.add(best_index)

            matches.append({
                "expected_index": expected_index,
                "actual_index": best_index,
                "similarity": round(
                    best_similarity,
                    1,
                ),
                "expected": expected_operation,
                "actual": actual_plan[best_index],
            })

    matched_quality = sum(
        match["similarity"]
        for match in matches
    )

    expected_count = len(expected_plan)
    actual_count = len(actual_plan)

    # How much of the expected plan was fulfilled?
    expected_coverage = (
        matched_quality / expected_count
        if expected_count
        else 1.0
    )

    # Penalize unnecessary operations.
    extra_count = (
        actual_count - len(matches)
    )

    extra_penalty = (
        extra_count / max(
            expected_count,
            1,
        )
    )

    # Expected operations are the main priority.
    normalized_score = (
        0.90 * expected_coverage
        + 0.10 * max(
            0.0,
            1.0 - extra_penalty,
        )
    )

    score = normalized_score * MAX_SCORE

    matched_expected_indexes = {
        match["expected_index"]
        for match in matches
    }

    missing = [
        operation
        for index, operation in enumerate(
            expected_plan
        )
        if index not in matched_expected_indexes
    ]

    extra = [
        operation
        for index, operation in enumerate(
            actual_plan
        )
        if index not in used_actual
    ]

    return round_score(score), {
        "expected": expected_plan,
        "actual": actual_plan,
        "matched": matches,
        "missing": missing,
        "extra": extra,
        "coverage": round(
            expected_coverage,
            1,
        ),
        "extra_penalty": round(
            extra_penalty,
            1,
        ),
    }


# ---------------------------------------------------------------------------
# Golden-case evaluation
# ---------------------------------------------------------------------------

def evaluate_case(
    case: dict,
    actual_state: dict,
) -> dict:
    """
    Evaluate one golden-dataset case.
    """

    expected = case.get(
        "expected",
        {},
    )

    # Expected values.
    expected_intents = expected.get(
        "intents",
        [],
    )

    expected_tickers = expected.get(
        "tickers",
        [],
    )

    expected_unavailable = expected.get(
        "unavailable_companies",
        [],
    )

    expected_plan = expected.get(
        "tool_plan",
        [],
    )

    # Actual values.
    actual_intents = actual_state.get(
        "intents",
        [],
    )

    actual_tickers = actual_state.get(
        "tickers",
        [],
    )

    actual_unavailable = actual_state.get(
        "unavailable_companies",
        [],
    )

    actual_plan = actual_state.get(
        "tool_plan",
        [],
    )

    # Score every deterministic dimension.
    intent_score, intent_details = score_intents(
        expected_intents,
        actual_intents,
    )

    ticker_score, ticker_details = score_tickers(
        expected_tickers,
        actual_tickers,
    )

    unavailable_score, unavailable_details = (
        score_unavailable_companies(
            expected_unavailable,
            actual_unavailable,
        )
    )

    planner_score, planner_details = score_planner(
        expected_plan,
        actual_plan,
    )

    # Overall = average of all four deterministic dimensions.
    overall_score = (
        intent_score
        + ticker_score
        + unavailable_score
        + planner_score
    ) / 4

    return {
        "id": case["id"],
        "query": case["query"],
        "category": case.get("category"),

        "scores": {
            "intent": round_score(intent_score),
            "ticker": round_score(ticker_score),
            "unavailable_company": round_score(
                unavailable_score
            ),
            "planner": round_score(planner_score),
            "overall": round_score(overall_score),
        },

        "details": {
            "intent": intent_details,
            "ticker": ticker_details,
            "unavailable_company": unavailable_details,
            "planner": planner_details,
        },

        "actual": {
            "intents": actual_intents,
            "tickers": actual_tickers,
            "unavailable_companies": actual_unavailable,
            "tool_plan": actual_plan,
        },
    }


# ---------------------------------------------------------------------------
# Real LangGraph execution
# ---------------------------------------------------------------------------

def run_query(query: str) -> dict:
    """
    Run one query through the actual application graph.

    The evaluator uses the real graph, so changes to:

        role router
        intent classifier
        entity extractor
        ticker resolver
        planner

    are automatically reflected in evaluation results.
    """

    initial_state = {
        "message": query,

        "role": "analyst",

        "intents": [],
        "intent": None,

        "tickers": [],
        "unavailable_companies": [],
        "company_entities": [],

        "tool_plan": [],
        "tool_results": {},

        "trace_steps": [],
        "final_output": None,
    }

    result = app_graph.invoke(
        initial_state
    )

    return result


# ---------------------------------------------------------------------------
# Dataset validation
# ---------------------------------------------------------------------------

def load_golden_dataset() -> list[dict]:
    """
    Load and validate the golden dataset.
    """

    if not os.path.exists(GOLDEN_PATH):
        raise FileNotFoundError(
            f"Golden dataset not found:\n{GOLDEN_PATH}"
        )

    with open(
        GOLDEN_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        dataset = json.load(file)

    if not isinstance(dataset, list):
        raise ValueError(
            "Golden dataset must contain a JSON list."
        )

    return dataset


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def print_summary(
    results: list[dict],
) -> None:
    """
    Print overall and category-level evaluation results.
    """

    if not results:
        return

    def average(key: str) -> float:
        return round(
            sum(
                result["scores"][key]
                for result in results
            ) / len(results),
            1,
        )

    print("\n" + "=" * 65)
    print("DETERMINISTIC EVALUATION SUMMARY")
    print("=" * 65)

    print(
        f"Cases evaluated          : "
        f"{len(results)}"
    )

    print(
        f"Intent score             : "
        f"{average('intent'):.1f}/5"
    )

    print(
        f"Ticker score             : "
        f"{average('ticker'):.1f}/5"
    )

    print(
        f"Unavailable-company score: "
        f"{average('unavailable_company'):.1f}/5"
    )

    print(
        f"Planner score            : "
        f"{average('planner'):.1f}/5"
    )

    print(
        f"Overall score            : "
        f"{average('overall'):.1f}/5"
    )

    # -------------------------------------------------------
    # Category summary
    # -------------------------------------------------------

    print("\nBy category:")

    categories = Counter(
        result.get("category")
        for result in results
    )

    for category in sorted(categories):

        category_results = [
            result
            for result in results
            if result.get("category") == category
        ]

        category_score = round(
            sum(
                result["scores"]["overall"]
                for result in category_results
            ) / len(category_results),
            1,
        )

        print(
            f"  {category:12s}: "
            f"{category_score:.1f}/5 "
            f"({len(category_results)} cases)"
        )

    # -------------------------------------------------------
    # Case summary
    # -------------------------------------------------------

    print("\nCase scores:")

    for result in results:

        print(
            f"  {result['id']}: "
            f"{result['scores']['overall']:.1f}/5 "
            f"- {result['query']}"
        )

    print("=" * 65)


# ---------------------------------------------------------------------------
# Main evaluation
# ---------------------------------------------------------------------------

def evaluate() -> None:
    """
    Run the complete deterministic evaluation.
    """

    golden_dataset = load_golden_dataset()

    results = []

    for index, case in enumerate(
        golden_dataset,
        start=1,
    ):

        query = case["query"]

        print(
            f"[{index}/{len(golden_dataset)}] "
            f"Evaluating: {query}"
        )

        try:
            actual_state = run_query(
                query
            )

            result = evaluate_case(
                case,
                actual_state,
            )

            results.append(result)

            print(
                f"    Intent     : "
                f"{result['scores']['intent']:.1f}/5"
            )

            print(
                f"    Ticker     : "
                f"{result['scores']['ticker']:.1f}/5"
            )

            print(
                f"    Unavailable: "
                f"{result['scores']['unavailable_company']:.1f}/5"
            )

            print(
                f"    Planner    : "
                f"{result['scores']['planner']:.1f}/5"
            )

            print(
                f"    Overall    : "
                f"{result['scores']['overall']:.1f}/5"
            )

        except Exception as exc:

            print(
                f"    ERROR: "
                f"{type(exc).__name__}: {exc}"
            )

            results.append({
                "id": case.get("id"),
                "query": query,
                "category": case.get(
                    "category"
                ),

                "error": {
                    "type": type(exc).__name__,
                    "message": str(exc),
                },

                "scores": {
                    "intent": 0.0,
                    "ticker": 0.0,
                    "unavailable_company": 0.0,
                    "planner": 0.0,
                    "overall": 0.0,
                },
            })

    # -------------------------------------------------------
    # Save detailed results
    # -------------------------------------------------------

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False,
        )

    # -------------------------------------------------------
    # Print summary
    # -------------------------------------------------------

    print_summary(
        results
    )

    print(
        f"\nSaved evaluation results to:\n"
        f"{OUTPUT_PATH}"
    )


if __name__ == "__main__":
    evaluate()
