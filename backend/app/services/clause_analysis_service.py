"""
Clause-Level Risk Analysis Service (v2) — Hybrid ML + Rule Engine
==================================================================
Orchestrates the full clause-level analysis pipeline:

    1. Split contract text into clauses
    2. For each clause:
       a. Run the ML model for a base prediction
       b. Run the rule-based engine for weighted risk assessment
       c. Blend both signals using a hybrid scoring strategy
       d. Generate human-readable explanations
    3. Compute overall contract risk score

Hybrid Strategy:
    - When the rule engine detects strong patterns (score >= 40),
      it can OVERRIDE a weak ML prediction (e.g., low -> high)
    - When both agree, confidence is boosted
    - When neither detects risk, the clause stays low
    - Multi-category hits further escalate risk

This is the main service consumed by the API route.
It reuses the existing ML pipeline (risk_service) for predictions.
"""

from typing import TypedDict
from app.services.clause_service import split_into_clauses, ClauseItem
from app.services.risk_service import predict_risk, model, vectorizer
from app.services.explanation_service import (
    generate_explanation,
    get_matched_risk_categories,
    assess_clause_risk,
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

# Risk level ordering for comparison
RISK_ORDER = {"low_risk": 0, "medium_risk": 1, "high_risk": 2}


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
           a. Get ML prediction
           b. Get rule-based assessment
           c. Blend into final risk level via hybrid strategy
           d. Compute final confidence
           e. Generate explanation
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

    # Step 2: Analyze each clause using hybrid approach
    analyzed_clauses: list[ClauseAnalysisResult] = []
    risk_scores: list[float] = []
    risk_distribution = {"low_risk": 0, "medium_risk": 0, "high_risk": 0}

    for clause in clauses:
        clause_text = clause["text"]

        # ── 2a. ML prediction ──
        try:
            ml_risk = predict_risk(clause_text)
        except Exception:
            ml_risk = "medium_risk"  # safe fallback

        ml_confidence = _get_confidence(clause_text, ml_risk)

        # ── 2b. Rule-based assessment ──
        rule_assessment = assess_clause_risk(clause_text)

        # ── 2c. Hybrid blending ──
        final_risk = _blend_risk_levels(
            ml_risk, ml_confidence,
            rule_assessment["suggested_risk"],
            rule_assessment["rule_score"],
            rule_assessment["category_count"],
        )

        # ── 2d. Final confidence ──
        final_confidence = _compute_final_confidence(
            ml_risk, ml_confidence,
            rule_assessment["suggested_risk"],
            rule_assessment["rule_score"],
            rule_assessment["confidence_boost"],
            rule_assessment["category_count"],
            final_risk,
        )

        # ── 2e. Explanation ──
        explanation = generate_explanation(clause_text, final_risk)
        risk_categories = rule_assessment["matched_categories"]

        # Track scores for overall calculation
        score = RISK_SCORE_MAP.get(final_risk, 60)
        risk_scores.append(score)

        # Update distribution
        if final_risk in risk_distribution:
            risk_distribution[final_risk] += 1

        analyzed_clauses.append({
            "id": clause["id"],
            "text": clause_text,
            "risk": final_risk,
            "confidence": round(final_confidence, 2),
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
# Hybrid Blending
# ──────────────────────────────────────────────────────────

def _blend_risk_levels(
    ml_risk: str,
    ml_confidence: float,
    rule_risk: str,
    rule_score: float,
    category_count: int,
) -> str:
    """
    Blends the ML prediction with the rule-based assessment
    to determine the final risk level.

    Strategy (priority order):
        1. If rule engine detects strong danger (score >= 40),
           override ML and use rule suggestion
        2. If multiple risk categories detected (>= 3),
           escalate to at least medium_risk
        3. If rule engine detects moderate danger (score >= 20),
           use the higher of ML vs rule
        4. If ML confidence is very high (>= 0.85),
           trust the ML prediction
        5. Otherwise, use the higher of the two

    Args:
        ml_risk:         ML model's predicted risk level
        ml_confidence:   ML model's confidence for its prediction
        rule_risk:       rule engine's suggested risk level
        rule_score:      rule engine's aggregate weighted score
        category_count:  number of distinct risk categories matched

    Returns:
        Final blended risk level string
    """
    ml_order = RISK_ORDER.get(ml_risk, 0)
    rule_order = RISK_ORDER.get(rule_risk, 0)

    # Strategy 1: Strong rule-based detection overrides ML
    if rule_score >= 40:
        # Rule engine is confident — use its suggestion,
        # but never downgrade from ML
        return max(ml_risk, rule_risk, key=lambda r: RISK_ORDER.get(r, 0))

    # Strategy 2: Multi-category compound risk
    if category_count >= 3:
        # 3+ risk categories = at least medium
        if rule_order >= 1 or ml_order >= 1:
            return max(ml_risk, rule_risk, key=lambda r: RISK_ORDER.get(r, 0))
        return "medium_risk"

    # Strategy 3: Moderate rule-based detection
    if rule_score >= 20:
        return max(ml_risk, rule_risk, key=lambda r: RISK_ORDER.get(r, 0))

    # Strategy 4: High-confidence ML
    if ml_confidence >= 0.85:
        return ml_risk

    # Strategy 5: Default — use the higher of the two
    return max(ml_risk, rule_risk, key=lambda r: RISK_ORDER.get(r, 0))


def _compute_final_confidence(
    ml_risk: str,
    ml_confidence: float,
    rule_risk: str,
    rule_score: float,
    confidence_boost: float,
    category_count: int,
    final_risk: str,
) -> float:
    """
    Computes the final confidence score by blending ML confidence
    with rule-based confidence signals.

    Boosts confidence when:
        - ML and rule engine agree on the risk level
        - Multiple risk categories are detected
        - Rule score is very high (strong pattern matches)

    Args:
        ml_risk:          ML model's prediction
        ml_confidence:    ML model's confidence
        rule_risk:        rule engine's suggestion
        rule_score:       rule engine's aggregate score
        confidence_boost: extra boost from the rule engine
        category_count:   number of matched categories
        final_risk:       the final blended risk level

    Returns:
        Final confidence between 0.0 and 0.99
    """
    base = ml_confidence

    # Boost when ML and rules agree
    if ml_risk == rule_risk:
        base += 0.10

    # Apply rule engine's confidence boost
    base += confidence_boost

    # Boost for multi-category matches
    if category_count >= 4:
        base += 0.12
    elif category_count >= 3:
        base += 0.08
    elif category_count >= 2:
        base += 0.04

    # If the final risk was escalated by rules (override scenario),
    # set a minimum confidence floor
    if final_risk != ml_risk:
        # Rule engine drove the decision
        rule_confidence = min(0.95, 0.60 + (rule_score / 200.0))
        base = max(base, rule_confidence)

    # Clamp to [0.30, 0.99]
    return max(0.30, min(0.99, base))


# ──────────────────────────────────────────────────────────
# ML Confidence Extraction
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
            import numpy as np
            decision = model.decision_function(features)[0]
            if isinstance(decision, np.ndarray):
                max_score = float(max(abs(decision)))
                return min(0.95, 0.5 + max_score * 0.1)
            else:
                return min(0.95, 0.5 + abs(float(decision)) * 0.1)

    except Exception as e:
        print(f"[ML] Could not extract confidence: {e}")

    # Fallback: return moderate confidence
    return 0.75


# ──────────────────────────────────────────────────────────
# Overall Scoring
# ──────────────────────────────────────────────────────────

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

    # Simple average for now
    avg = sum(risk_scores) / len(risk_scores)

    # Apply a slight high-risk bias: max clause score pulls the average up
    max_score = max(risk_scores)
    weighted = (avg * 0.7) + (max_score * 0.3)

    return min(100.0, weighted)


def _determine_overall_risk(score: float) -> str:
    """
    Maps a numerical risk score to a risk category label.

    Thresholds:
        0-35   -> LOW
        36-70  -> MEDIUM
        71-100 -> HIGH

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
