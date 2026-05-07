"""
Clause-Level Risk Analysis Service
-----------------------------------
Orchestrates the full clause-level analysis pipeline:

    1. Split contract text into clauses
    2. Classify each clause individually via the ML model
    3. Generate explanations for each clause
    4. Compute overall contract risk score

This is the main service consumed by the API route.
It reuses the existing ML pipeline (risk_service) for predictions.
"""

from typing import TypedDict
from app.services.clause_service import split_into_clauses, ClauseItem
from app.services.risk_service import predict_risk, model, vectorizer
from app.services.explanation_service import (
    generate_explanation,
    get_matched_risk_categories,
)


# ──────────────────────────────────────────────────────────
# Scoring Constants
# ──────────────────────────────────────────────────────────

RISK_SCORE_MAP = {
    "low_risk": 25,
    "medium_risk": 60,
    "high_risk": 90,
}

OVERALL_RISK_THRESHOLDS = {
    "LOW": (0, 35),
    "MEDIUM": (36, 70),
    "HIGH": (71, 100),
}


# ──────────────────────────────────────────────────────────
# Response Types
# ──────────────────────────────────────────────────────────

class ClauseAnalysisResult(TypedDict):
    """Analysis result for a single clause."""
    id: int
    text: str
    risk: str
    confidence: float
    explanation: str
    risk_categories: list[str]


class ContractAnalysisResult(TypedDict):
    """Full clause-level analysis result for a contract."""
    overallRisk: str
    overallScore: float
    totalClauses: int
    riskDistribution: dict[str, int]
    clauses: list[ClauseAnalysisResult]


# ──────────────────────────────────────────────────────────
# Core Analysis Function
# ──────────────────────────────────────────────────────────

def analyze_contract_clauses(text: str) -> ContractAnalysisResult:
    """
    Performs full clause-level risk analysis on contract text.

    Pipeline:
        1. Split text into clauses
        2. For each clause:
           a. Predict risk level using the ML model
           b. Extract confidence score from model probabilities
           c. Generate human-readable explanation
           d. Detect risk categories
        3. Calculate overall risk score and distribution

    Args:
        text: full contract text to analyze

    Returns:
        ContractAnalysisResult with overall score, risk level,
        distribution, and per-clause analysis.

    Raises:
        ValueError: if the input text is empty
    """
    if not text or not text.strip():
        raise ValueError("Cannot analyze empty text.")

    # Step 1: Split into clauses
    clauses = split_into_clauses(text)

    if not clauses:
        # If splitting produces nothing, treat entire text as one clause
        clauses = [{"id": 1, "text": text.strip()}]

    # Step 2: Analyze each clause
    analyzed_clauses: list[ClauseAnalysisResult] = []
    risk_scores: list[float] = []
    risk_distribution = {"low_risk": 0, "medium_risk": 0, "high_risk": 0}

    for clause in clauses:
        clause_text = clause["text"]

        # Predict risk for this clause
        try:
            risk_level = predict_risk(clause_text)
        except Exception:
            risk_level = "medium_risk"  # safe fallback

        # Extract confidence from model probability estimates
        confidence = _get_confidence(clause_text, risk_level)

        # Generate explanation
        explanation = generate_explanation(clause_text, risk_level)

        # Detect risk categories
        risk_categories = get_matched_risk_categories(clause_text)

        # Track scores
        score = RISK_SCORE_MAP.get(risk_level, 60)
        risk_scores.append(score)

        # Update distribution
        if risk_level in risk_distribution:
            risk_distribution[risk_level] += 1

        analyzed_clauses.append({
            "id": clause["id"],
            "text": clause_text,
            "risk": risk_level,
            "confidence": round(confidence, 2),
            "explanation": explanation,
            "risk_categories": risk_categories,
        })

    # Step 3: Calculate overall risk score
    overall_score = _calculate_overall_score(risk_scores)
    overall_risk = _determine_overall_risk(overall_score)

    return {
        "overallRisk": overall_risk,
        "overallScore": round(overall_score, 1),
        "totalClauses": len(analyzed_clauses),
        "riskDistribution": risk_distribution,
        "clauses": analyzed_clauses,
    }


# ──────────────────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────────────────

def _get_confidence(clause_text: str, predicted_label: str) -> float:
    """
    Extracts the confidence score for the predicted label
    from the model's probability estimates.

    Falls back to a heuristic confidence if the model doesn't
    support predict_proba (e.g., some SVM configurations).

    Args:
        clause_text:     the clause text
        predicted_label: the predicted risk label

    Returns:
        Confidence score between 0.0 and 1.0
    """
    try:
        features = vectorizer.transform([clause_text])

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(features)[0]
            class_labels = model.classes_

            # Find the index of the predicted label
            label_idx = list(class_labels).index(predicted_label)
            return float(probabilities[label_idx])

        elif hasattr(model, "decision_function"):
            # For SVM: use decision function distance as pseudo-confidence
            decision = model.decision_function(features)[0]
            # Normalize to 0-1 range using sigmoid-like transformation
            import numpy as np
            if isinstance(decision, np.ndarray):
                max_score = float(max(abs(decision)))
                return min(0.95, 0.5 + max_score * 0.1)
            else:
                return min(0.95, 0.5 + abs(float(decision)) * 0.1)

    except Exception as e:
        print(f"[ML] Could not extract confidence: {e}")

    # Fallback: return moderate confidence
    return 0.75


def _calculate_overall_score(risk_scores: list[float]) -> float:
    """
    Calculates the overall contract risk score as a weighted average.

    Uses a slight bias toward higher-risk clauses to ensure that
    a few dangerous clauses aren't diluted by many safe ones.

    Args:
        risk_scores: list of individual clause risk scores (0-100)

    Returns:
        Overall score between 0 and 100.
    """
    if not risk_scores:
        return 0.0

    # Simple average for now — can be upgraded to weighted
    avg = sum(risk_scores) / len(risk_scores)

    # Apply a slight high-risk bias: max clause score pulls the average up
    max_score = max(risk_scores)
    weighted = (avg * 0.7) + (max_score * 0.3)

    return min(100.0, weighted)


def _determine_overall_risk(score: float) -> str:
    """
    Maps a numerical risk score to a risk category label.

    Thresholds:
        0-35   → LOW
        36-70  → MEDIUM
        71-100 → HIGH

    Args:
        score: overall risk score (0-100)

    Returns:
        Risk label: 'LOW', 'MEDIUM', or 'HIGH'
    """
    if score <= 35:
        return "LOW"
    elif score <= 70:
        return "MEDIUM"
    else:
        return "HIGH"
