"""
Explanation Engine
------------------
Generates human-readable explanations for clause-level risk predictions
using a rule-based keyword detection system.

This is a lightweight, explainable AI approach that:
    1. Scans clause text for known risk indicators (keywords/phrases)
    2. Maps matched patterns to risk categories and explanations
    3. Aggregates multiple matches into a comprehensive explanation

Designed to be replaced or augmented by a transformer-based
explanation model (e.g., LIME/SHAP on BERT) in the future.
"""

import re
from typing import TypedDict


class RiskPattern(TypedDict):
    """Defines a risk-indicator pattern with its explanation."""
    pattern: str         # regex pattern to match
    category: str        # risk category name
    explanation: str     # human-readable explanation


# ──────────────────────────────────────────────────────────
# Risk Pattern Registry
# Organized by severity: high-risk patterns first
# ──────────────────────────────────────────────────────────

RISK_PATTERNS: list[RiskPattern] = [
    # ─── Liability & Indemnification ───
    {
        "pattern": r"\bnot?\s+liable\b",
        "category": "Liability Limitation",
        "explanation": "This clause limits or removes liability obligations, potentially exposing one party to unprotected financial risk.",
    },
    {
        "pattern": r"\bno\s+liability\b",
        "category": "Liability Exclusion",
        "explanation": "This clause excludes liability entirely, which may leave one party without recourse for damages.",
    },
    {
        "pattern": r"\bwithout\s+limitation\b",
        "category": "Unlimited Exposure",
        "explanation": "The absence of limitation clauses may expose a party to uncapped financial obligations.",
    },
    {
        "pattern": r"\bindemnif(?:y|ication|ied)\b",
        "category": "Indemnification",
        "explanation": "Indemnification clauses transfer risk and financial responsibility between parties.",
    },
    {
        "pattern": r"\bhold\s+harmless\b",
        "category": "Hold Harmless",
        "explanation": "Hold harmless provisions shift liability burden and may limit legal recourse.",
    },
    {
        "pattern": r"\bwaive[sd]?\b|\bwaiver\b",
        "category": "Rights Waiver",
        "explanation": "This clause involves waiving rights, which may permanently forfeit legal protections.",
    },

    # ─── Termination ───
    {
        "pattern": r"\bterminate\s+immediately\b",
        "category": "Immediate Termination",
        "explanation": "Immediate termination without cure period creates unfair exit conditions.",
    },
    {
        "pattern": r"\bterminate[sd]?\b.*\bwithout\s+(?:prior\s+)?(?:notice|cause)\b",
        "category": "Unfair Termination",
        "explanation": "Termination without notice or cause allows unilateral contract exit, creating instability.",
    },
    {
        "pattern": r"\btermination\b.*\bsole\s+discretion\b",
        "category": "Discretionary Termination",
        "explanation": "Sole discretion termination gives one party disproportionate power to end the agreement.",
    },
    {
        "pattern": r"\birrevocable\b",
        "category": "Irrevocable Terms",
        "explanation": "Irrevocable terms cannot be reversed and may lock parties into unfavorable conditions.",
    },

    # ─── Financial ───
    {
        "pattern": r"\bliquidated\s+damages\b",
        "category": "Liquidated Damages",
        "explanation": "Pre-determined damage amounts may not reflect actual losses and can be punitive.",
    },
    {
        "pattern": r"\bpenalt(?:y|ies)\b",
        "category": "Financial Penalties",
        "explanation": "Financial penalties may impose disproportionate costs for non-compliance.",
    },
    {
        "pattern": r"\bforfeit(?:ure|ed|s)?\b",
        "category": "Forfeiture",
        "explanation": "Forfeiture provisions may result in loss of rights, deposits, or earned benefits.",
    },
    {
        "pattern": r"\ball\s+damages\b",
        "category": "Unlimited Damages",
        "explanation": "Exposure to 'all damages' without caps creates significant financial risk.",
    },

    # ─── Restrictive Covenants ───
    {
        "pattern": r"\bnon-compete\b|\bnon\s*competition\b",
        "category": "Non-Compete",
        "explanation": "Non-compete restrictions may limit future business opportunities and employment.",
    },
    {
        "pattern": r"\bnon-solicitation\b",
        "category": "Non-Solicitation",
        "explanation": "Non-solicitation clauses restrict engagement with clients or employees after contract ends.",
    },
    {
        "pattern": r"\bexclusive\b.*\brights?\b|\bexclusivity\b",
        "category": "Exclusivity",
        "explanation": "Exclusivity provisions may prevent engagement with competitors or alternative partners.",
    },

    # ─── Dispute Resolution ───
    {
        "pattern": r"\blitigation\b",
        "category": "Litigation Risk",
        "explanation": "References to litigation indicate potential for costly legal proceedings.",
    },
    {
        "pattern": r"\barbitration\b",
        "category": "Arbitration",
        "explanation": "Mandatory arbitration may limit access to courts and public trial rights.",
    },
    {
        "pattern": r"\bjurisdiction\b.*\bany\b|\bany\s+jurisdiction\b",
        "category": "Broad Jurisdiction",
        "explanation": "Broad jurisdiction clauses may force legal proceedings in unfavorable venues.",
    },

    # ─── Notice & Compliance ───
    {
        "pattern": r"\bwithout\s+(?:prior\s+)?notice\b",
        "category": "No Notice Required",
        "explanation": "Actions permitted without notice remove the opportunity for the other party to respond or prepare.",
    },
    {
        "pattern": r"\bbinding\b.*\bfinal\b|\bfinal\s+and\s+binding\b",
        "category": "Binding & Final",
        "explanation": "Final and binding provisions eliminate appeal options and dispute resolution flexibility.",
    },

    # ─── Data & IP ───
    {
        "pattern": r"\bconfidential(?:ity)?\b.*\bperpetuity\b|\bindefinite(?:ly)?\b.*\bconfidential\b",
        "category": "Perpetual Confidentiality",
        "explanation": "Indefinite confidentiality obligations may create long-term compliance burden.",
    },
    {
        "pattern": r"\bintellectual\s+property\b.*\btransfer\b|\bassign(?:ment|s)?\b.*\bip\b",
        "category": "IP Transfer",
        "explanation": "IP transfer or assignment clauses may permanently surrender ownership of created work.",
    },

    # ─── General Protective ───
    {
        "pattern": r"\bbreach\b",
        "category": "Breach Provisions",
        "explanation": "Breach-related clauses define consequences for contract violations.",
    },
    {
        "pattern": r"\bnegligence\b",
        "category": "Negligence",
        "explanation": "Negligence provisions allocate responsibility for careless or reckless conduct.",
    },
]


def generate_explanation(clause_text: str, risk_level: str) -> str:
    """
    Generates a human-readable explanation for why a clause was classified
    at a certain risk level.

    Args:
        clause_text: the clause text to analyze
        risk_level:  predicted risk level ('low_risk', 'medium_risk', 'high_risk')

    Returns:
        A combined explanation string based on matched patterns.
        Falls back to a generic explanation if no patterns match.
    """
    if not clause_text:
        return "No text provided for analysis."

    text_lower = clause_text.lower()
    matched_explanations = []
    matched_categories = []

    for pattern_def in RISK_PATTERNS:
        if re.search(pattern_def["pattern"], text_lower):
            if pattern_def["category"] not in matched_categories:
                matched_categories.append(pattern_def["category"])
                matched_explanations.append(pattern_def["explanation"])

    # Build the final explanation
    if matched_explanations:
        # Combine multiple explanations with risk indicators
        risk_indicators = ", ".join(matched_categories)
        combined = " ".join(matched_explanations)
        return f"Risk indicators detected: {risk_indicators}. {combined}"

    # Fallback explanations based on risk level
    fallbacks = {
        "high_risk": (
            "This clause contains language patterns associated with high legal or financial risk. "
            "Manual legal review is recommended."
        ),
        "medium_risk": (
            "This clause contains moderate risk language. "
            "Some terms may require negotiation or clarification."
        ),
        "low_risk": (
            "This clause appears to use standard, balanced legal language "
            "with minimal risk indicators."
        ),
    }

    return fallbacks.get(risk_level, "Unable to determine risk explanation.")


def get_matched_risk_categories(clause_text: str) -> list[str]:
    """
    Returns a list of risk category names matched in the clause.
    Useful for frontend highlighting and filtering.

    Args:
        clause_text: the clause text to scan

    Returns:
        List of matched category names.
    """
    if not clause_text:
        return []

    text_lower = clause_text.lower()
    categories = []

    for pattern_def in RISK_PATTERNS:
        if re.search(pattern_def["pattern"], text_lower):
            if pattern_def["category"] not in categories:
                categories.append(pattern_def["category"])

    return categories
