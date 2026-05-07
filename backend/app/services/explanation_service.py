"""
Explanation Engine (v2) — Weighted, Context-Aware Risk Detection
================================================================
Rule-based legal risk detection with:

    1. Weighted keyword scoring (strong=40, moderate=20, contextual=10)
    2. Context-aware combination matching (multi-phrase escalation)
    3. 50+ risk patterns across 10 legal categories
    4. Rule-based risk assessment that can override/boost ML predictions
    5. Confidence boosting when multiple risk categories are detected

Core design: every pattern carries a `weight` field that feeds directly
into the clause risk score.  The `assess_clause_risk()` function returns
a numerical score + suggested risk level so the analysis service can
blend it with the ML prediction.

Designed for modularity — pattern registry can be extended or swapped
for a transformer-based model (e.g., LIME/SHAP on BERT) in the future.
"""

import re
from typing import TypedDict


# ──────────────────────────────────────────────────────────
# Types
# ──────────────────────────────────────────────────────────

class WeightedRiskPattern(TypedDict):
    """A risk-indicator pattern with severity weight."""
    pattern: str         # regex pattern (applied to lowercased text)
    category: str        # risk category label
    weight: int          # score contribution: 40 = strong, 20 = moderate, 10 = contextual
    explanation: str     # human-readable explanation


class RiskAssessment(TypedDict):
    """Result of rule-based risk assessment for a clause."""
    rule_score: float           # aggregate weighted score (0-100+)
    suggested_risk: str         # 'low_risk', 'medium_risk', or 'high_risk'
    matched_categories: list[str]
    matched_explanations: list[str]
    category_count: int         # how many distinct categories matched
    confidence_boost: float     # extra confidence from strong pattern matches


# ──────────────────────────────────────────────────────────
# Risk Pattern Registry  (50+ patterns, 10 categories)
#
# Weight guide:
#   40 = strong legal danger phrase   (auto-escalate to high risk)
#   20 = moderate risk phrase         (escalate to medium+ risk)
#   10 = contextual / general phrase  (contributes but doesn't escalate alone)
# ──────────────────────────────────────────────────────────

RISK_PATTERNS: list[WeightedRiskPattern] = [

    # ━━━ 1. LIABILITY & INDEMNIFICATION (strong) ━━━
    {
        "pattern": r"\bnot?\s+(?:be\s+)?(?:held\s+)?liable\b",
        "category": "Liability Limitation",
        "weight": 40,
        "explanation": "This clause limits or removes liability obligations, potentially exposing one party to unprotected financial risk.",
    },
    {
        "pattern": r"\bno\s+liability\b",
        "category": "Liability Exclusion",
        "weight": 40,
        "explanation": "This clause excludes liability entirely, which may leave one party without recourse for damages.",
    },
    {
        "pattern": r"\blimitation\s+of\s+liability\b",
        "category": "Liability Cap",
        "weight": 40,
        "explanation": "Limitation of liability clauses cap the maximum recoverable amount, often far below actual damages.",
    },
    {
        "pattern": r"\bwaive\s+(?:any\s+)?liability\b|\bliability\s+(?:is\s+)?waived\b",
        "category": "Liability Waiver",
        "weight": 40,
        "explanation": "Waiving liability removes the legal obligation to compensate for harm or damages.",
    },
    {
        "pattern": r"\bconsequential\s+damages\b",
        "category": "Consequential Damages Exclusion",
        "weight": 40,
        "explanation": "Excluding consequential damages removes compensation for indirect losses such as lost profits or business disruption.",
    },
    {
        "pattern": r"\bincidental\s+damages\b",
        "category": "Incidental Damages Exclusion",
        "weight": 40,
        "explanation": "Excluding incidental damages removes compensation for costs incurred as a result of a breach.",
    },
    {
        "pattern": r"\bindemnif(?:y|ication|ied|ies)\b",
        "category": "Indemnification",
        "weight": 20,
        "explanation": "Indemnification clauses transfer risk and financial responsibility between parties.",
    },
    {
        "pattern": r"\bhold\s+harmless\b|\bharmless\b",
        "category": "Hold Harmless",
        "weight": 40,
        "explanation": "Hold harmless provisions shift the entire liability burden and may eliminate legal recourse.",
    },
    {
        "pattern": r"\bwithout\s+limitation\b",
        "category": "Unlimited Exposure",
        "weight": 20,
        "explanation": "The absence of limitation clauses may expose a party to uncapped financial obligations.",
    },
    {
        "pattern": r"\ball\s+damages\b",
        "category": "Unlimited Damages",
        "weight": 40,
        "explanation": "Exposure to 'all damages' without caps creates significant financial risk.",
    },

    # ━━━ 2. NON-COMPETE & RESTRICTIVE COVENANTS (strong) ━━━
    {
        "pattern": r"\bnon[\s-]*compet(?:e|ition|ing)\b",
        "category": "Non-Compete",
        "weight": 40,
        "explanation": "Non-compete restrictions may severely limit future business opportunities and employment.",
    },
    {
        "pattern": r"\brestrictive\s+covenant\b",
        "category": "Restrictive Covenant",
        "weight": 40,
        "explanation": "Restrictive covenants impose binding limitations on future professional activities.",
    },
    {
        "pattern": r"\bcompeting\s+organi[sz]ations?\b",
        "category": "Competition Restriction",
        "weight": 40,
        "explanation": "Restrictions involving competing organizations limit professional freedom after the agreement ends.",
    },
    {
        "pattern": r"\bprohibited\s+from\s+working\b",
        "category": "Employment Prohibition",
        "weight": 40,
        "explanation": "Work prohibition clauses restrict the right to seek employment in relevant industries.",
    },
    {
        "pattern": r"\brestricted\s+employment\b",
        "category": "Employment Restriction",
        "weight": 40,
        "explanation": "Employment restrictions limit the ability to work in specific roles or industries.",
    },
    {
        "pattern": r"\bafter\s+termination\b.*\b(?:shall\s+not|prohibited|restricted|refrain)\b",
        "category": "Post-Termination Restriction",
        "weight": 40,
        "explanation": "Post-termination restrictions continue to bind a party after the contract ends.",
    },
    {
        "pattern": r"\bnon[\s-]*solicitation\b",
        "category": "Non-Solicitation",
        "weight": 20,
        "explanation": "Non-solicitation clauses restrict engagement with clients or employees after contract ends.",
    },

    # ━━━ 3. UNILATERAL CONTROL (strong) ━━━
    {
        "pattern": r"\bsole\s+discretion\b|\bat\s+its\s+(?:sole\s+)?discretion\b",
        "category": "Sole Discretion",
        "weight": 40,
        "explanation": "Sole discretion grants one party unchecked unilateral power over critical decisions.",
    },
    {
        "pattern": r"\bmay\s+modify\s+(?:the\s+)?terms?\b|\bmodify\s+(?:this\s+)?agreement\b",
        "category": "Unilateral Modification",
        "weight": 40,
        "explanation": "Unilateral modification rights allow one party to change contract terms without mutual agreement.",
    },
    {
        "pattern": r"\bwithout\s+(?:prior\s+)?(?:informing|notifying|consulting)\b",
        "category": "No Consultation Required",
        "weight": 40,
        "explanation": "Actions taken without informing the other party bypass fundamental fairness protections.",
    },
    {
        "pattern": r"\bunilateral(?:ly)?\s+(?:change|modify|amend|alter|update)\b",
        "category": "Unilateral Changes",
        "weight": 40,
        "explanation": "Unilateral changes to terms remove the counterparty's ability to negotiate or consent.",
    },
    {
        "pattern": r"\breserves?\s+the\s+right\b",
        "category": "Reserved Rights",
        "weight": 20,
        "explanation": "Broad 'reserves the right' language may grant unchecked unilateral power.",
    },

    # ━━━ 4. TERMINATION (strong) ━━━
    {
        "pattern": r"\bterminate\s+immediately\b",
        "category": "Immediate Termination",
        "weight": 40,
        "explanation": "Immediate termination without cure period creates unfair exit conditions.",
    },
    {
        "pattern": r"\bterminate[sd]?\b.*\bwithout\s+(?:prior\s+)?(?:notice|cause)\b",
        "category": "Unfair Termination",
        "weight": 40,
        "explanation": "Termination without notice or cause allows unilateral contract exit, creating instability.",
    },
    {
        "pattern": r"\btermination\b.*\bsole\s+discretion\b|\bsole\s+discretion\b.*\btermination\b",
        "category": "Discretionary Termination",
        "weight": 40,
        "explanation": "Sole discretion termination gives one party disproportionate power to end the agreement.",
    },
    {
        "pattern": r"\birrevocable\b",
        "category": "Irrevocable Terms",
        "weight": 20,
        "explanation": "Irrevocable terms cannot be reversed and may lock parties into unfavorable conditions.",
    },

    # ━━━ 5. ARBITRATION & DISPUTE RESOLUTION (strong) ━━━
    {
        "pattern": r"\bbinding\s+arbitration\b",
        "category": "Binding Arbitration",
        "weight": 40,
        "explanation": "Binding arbitration eliminates the right to a court trial and limits appeal options.",
    },
    {
        "pattern": r"\bexclusive\s+jurisdiction\b",
        "category": "Exclusive Jurisdiction",
        "weight": 40,
        "explanation": "Exclusive jurisdiction forces all legal proceedings to a single venue, potentially disadvantaging one party.",
    },
    {
        "pattern": r"\bwaive\b.*\bjury\s+trial\b|\bjury\s+trial\b.*\bwaive[sd]?\b",
        "category": "Jury Trial Waiver",
        "weight": 40,
        "explanation": "Waiving the right to a jury trial removes a fundamental legal protection.",
    },
    {
        "pattern": r"\barbitration\b",
        "category": "Arbitration",
        "weight": 20,
        "explanation": "Mandatory arbitration may limit access to courts and public trial rights.",
    },
    {
        "pattern": r"\blitigation\b",
        "category": "Litigation Risk",
        "weight": 10,
        "explanation": "References to litigation indicate potential for costly legal proceedings.",
    },
    {
        "pattern": r"\bjurisdiction\b.*\bany\b|\bany\s+jurisdiction\b",
        "category": "Broad Jurisdiction",
        "weight": 20,
        "explanation": "Broad jurisdiction clauses may force legal proceedings in unfavorable venues.",
    },
    {
        "pattern": r"\bbinding\b.*\bfinal\b|\bfinal\s+and\s+binding\b",
        "category": "Binding & Final",
        "weight": 20,
        "explanation": "Final and binding provisions eliminate appeal options and dispute resolution flexibility.",
    },

    # ━━━ 6. INTELLECTUAL PROPERTY (strong) ━━━
    {
        "pattern": r"\bexclusive\s+property\b",
        "category": "Exclusive Property Claim",
        "weight": 40,
        "explanation": "Exclusive property clauses may permanently transfer ownership of all created work.",
    },
    {
        "pattern": r"\bownership\s+(?:is\s+)?transfer(?:red|s)?\b|\btransfer\s+(?:of\s+)?ownership\b",
        "category": "Ownership Transfer",
        "weight": 40,
        "explanation": "Ownership transfer permanently surrenders proprietary rights to the other party.",
    },
    {
        "pattern": r"\bperpetual\s+(?:rights?|license)\b|\bin\s+perpetuity\b",
        "category": "Perpetual Rights",
        "weight": 40,
        "explanation": "Perpetual rights grant permanent, unlimited access that can never be revoked.",
    },
    {
        "pattern": r"\bintellectual\s+property\b.*\b(?:transfer|assign|belong|vest)\b",
        "category": "IP Transfer",
        "weight": 40,
        "explanation": "IP transfer or assignment clauses may permanently surrender ownership of created work.",
    },
    {
        "pattern": r"\bassign(?:ment|s)?\b.*\b(?:ip|intellectual\s+property|copyright|patent)\b",
        "category": "IP Assignment",
        "weight": 40,
        "explanation": "IP assignment transfers all intellectual property rights from creator to the other party.",
    },
    {
        "pattern": r"\bexclusive\b.*\brights?\b|\bexclusivity\b",
        "category": "Exclusivity",
        "weight": 20,
        "explanation": "Exclusivity provisions may prevent engagement with competitors or alternative partners.",
    },

    # ━━━ 7. FINANCIAL PENALTIES (moderate-strong) ━━━
    {
        "pattern": r"\bliquidated\s+damages\b",
        "category": "Liquidated Damages",
        "weight": 20,
        "explanation": "Pre-determined damage amounts may not reflect actual losses and can be punitive.",
    },
    {
        "pattern": r"\bpenalt(?:y|ies)\b",
        "category": "Financial Penalties",
        "weight": 20,
        "explanation": "Financial penalties may impose disproportionate costs for non-compliance.",
    },
    {
        "pattern": r"\bforfeit(?:ure|ed|s)?\b",
        "category": "Forfeiture",
        "weight": 20,
        "explanation": "Forfeiture provisions may result in loss of rights, deposits, or earned benefits.",
    },

    # ━━━ 8. NOTICE & COMPLIANCE (moderate-strong) ━━━
    {
        "pattern": r"\bwithout\s+(?:prior\s+)?notice\b",
        "category": "No Notice Required",
        "weight": 40,
        "explanation": "Actions permitted without notice remove the opportunity for the other party to respond or prepare.",
    },
    {
        "pattern": r"\bwaive[sd]?\b|\bwaiver\b",
        "category": "Rights Waiver",
        "weight": 20,
        "explanation": "This clause involves waiving rights, which may permanently forfeit legal protections.",
    },

    # ━━━ 9. CONFIDENTIALITY (moderate) ━━━
    {
        "pattern": r"\bconfidential(?:ity)?\b.*\b(?:perpetuity|indefinite(?:ly)?|survive)\b",
        "category": "Perpetual Confidentiality",
        "weight": 20,
        "explanation": "Indefinite confidentiality obligations may create long-term compliance burden.",
    },

    # ━━━ 10. GENERAL / CONTEXTUAL (low weight) ━━━
    {
        "pattern": r"\bbreach\b",
        "category": "Breach Provisions",
        "weight": 10,
        "explanation": "Breach-related clauses define consequences for contract violations.",
    },
    {
        "pattern": r"\bnegligence\b",
        "category": "Negligence",
        "weight": 10,
        "explanation": "Negligence provisions allocate responsibility for careless or reckless conduct.",
    },
    {
        "pattern": r"\bliable\s+for\s+(?:all|any|every)\b",
        "category": "Broad Liability",
        "weight": 40,
        "explanation": "Broad liability language exposes a party to open-ended financial obligations.",
    },
]


# ──────────────────────────────────────────────────────────
# Context-Aware Combination Rules
#
# These match when MULTIPLE phrases co-occur in the same
# clause, escalating the risk beyond individual pattern scores.
# Each combo adds a flat bonus to the clause score.
# ──────────────────────────────────────────────────────────

class CombinationRule(TypedDict):
    """A rule that fires when multiple patterns co-occur."""
    patterns: list[str]       # all must match (lowercased regex)
    bonus: int                # extra score to add
    category: str             # category label for the combo
    explanation: str           # explanation for the escalation


COMBINATION_RULES: list[CombinationRule] = [
    {
        "patterns": [r"\bnot?\s+(?:be\s+)?(?:held\s+)?liable\b", r"\bdamages?\b"],
        "bonus": 40,
        "category": "Liability + Damages Escalation",
        "explanation": "Combining liability exclusion with damages creates a high-risk clause that removes financial protections entirely.",
    },
    {
        "patterns": [r"\bnon[\s-]*compet(?:e|ition|ing)\b", r"\b\d+\s*(?:year|month|yr)"],
        "bonus": 40,
        "category": "Long-Term Non-Compete",
        "explanation": "A time-bound non-compete clause imposes extended restrictions on professional freedom.",
    },
    {
        "patterns": [r"\bterminate\b", r"\bimmediately\b|\bwithout\s+(?:prior\s+)?notice\b"],
        "bonus": 30,
        "category": "Immediate Termination Combo",
        "explanation": "Termination combined with immediacy or lack of notice creates severely unfair exit conditions.",
    },
    {
        "patterns": [r"\bsole\s+discretion\b", r"\bterminate\b|\bmodify\b|\bchange\b|\bamend\b"],
        "bonus": 40,
        "category": "Discretionary Power Escalation",
        "explanation": "Sole discretion combined with termination or modification rights grants unchecked unilateral power.",
    },
    {
        "patterns": [r"\bexclusive\s+property\b", r"\bcompany\b|\bemployer\b|\bclient\b"],
        "bonus": 30,
        "category": "IP Ownership Escalation",
        "explanation": "Work designated as exclusive property of the company permanently surrenders creator rights.",
    },
    {
        "patterns": [r"\bbinding\s+arbitration\b", r"\bfinal\b|\bwaive\b"],
        "bonus": 30,
        "category": "Arbitration Lock-In",
        "explanation": "Binding arbitration with finality or waiver removes all judicial recourse options.",
    },
    {
        "patterns": [r"\bindemnif", r"\ball\s+(?:claims?|damages?|loss(?:es)?)\b"],
        "bonus": 30,
        "category": "Broad Indemnification",
        "explanation": "Indemnification covering all claims or damages creates uncapped financial exposure.",
    },
    {
        "patterns": [r"\breserves?\s+the\s+right\b", r"\bmodify\b|\bterminate\b|\bchange\b|\bsuspend\b"],
        "bonus": 30,
        "category": "Reserved Power Escalation",
        "explanation": "Reserving the right to modify or terminate unilaterally creates an imbalanced agreement.",
    },
    {
        "patterns": [r"\bpenalt(?:y|ies)\b", r"\b(?:late|delay|fail|breach)\b"],
        "bonus": 20,
        "category": "Penalty Escalation",
        "explanation": "Penalties tied to delays or failures may impose disproportionate financial consequences.",
    },
    {
        "patterns": [r"\bwaive\b", r"\bright(?:s)?\b"],
        "bonus": 20,
        "category": "Rights Waiver Escalation",
        "explanation": "Waiving rights may permanently forfeit critical legal protections.",
    },
    {
        "patterns": [r"\bperpetual\b|\bin\s+perpetuity\b|\bindefinite\b", r"\blicense\b|\brights?\b|\bownership\b"],
        "bonus": 30,
        "category": "Perpetual Grant Escalation",
        "explanation": "Perpetual or indefinite grants create permanent, irrevocable obligations.",
    },
    {
        "patterns": [r"\bconfidential", r"\bindefinite(?:ly)?\b|\bperpetuity\b|\bsurvive\b.*\btermination\b"],
        "bonus": 20,
        "category": "Perpetual Confidentiality Escalation",
        "explanation": "Indefinite confidentiality obligations that survive termination create a permanent compliance burden.",
    },
]


# ──────────────────────────────────────────────────────────
# Rule-Based Risk Assessment
# ──────────────────────────────────────────────────────────

def assess_clause_risk(clause_text: str) -> RiskAssessment:
    """
    Performs weighted, context-aware risk assessment on a single clause.

    Returns a RiskAssessment with:
        - rule_score:    aggregate score from all matching patterns + combos
        - suggested_risk: the risk level the rule engine recommends
        - matched_categories / matched_explanations
        - confidence_boost: extra confidence from strong multi-category hits

    The calling service blends this with the ML prediction.

    Args:
        clause_text: the clause text to assess

    Returns:
        RiskAssessment dict
    """
    if not clause_text:
        return {
            "rule_score": 0,
            "suggested_risk": "low_risk",
            "matched_categories": [],
            "matched_explanations": [],
            "category_count": 0,
            "confidence_boost": 0.0,
        }

    text_lower = clause_text.lower()

    # ── Phase 1: Individual pattern matching ──
    total_score = 0
    matched_categories: list[str] = []
    matched_explanations: list[str] = []

    for p in RISK_PATTERNS:
        if re.search(p["pattern"], text_lower):
            if p["category"] not in matched_categories:
                matched_categories.append(p["category"])
                matched_explanations.append(p["explanation"])
                total_score += p["weight"]

    # ── Phase 2: Combination rule matching ──
    for combo in COMBINATION_RULES:
        all_match = all(
            re.search(pat, text_lower) for pat in combo["patterns"]
        )
        if all_match:
            total_score += combo["bonus"]
            if combo["category"] not in matched_categories:
                matched_categories.append(combo["category"])
                matched_explanations.append(combo["explanation"])

    # ── Phase 3: Multi-category escalation ──
    # When 3+ distinct categories fire, add extra score for compound risk
    category_count = len(matched_categories)
    if category_count >= 4:
        total_score += 30    # heavy compound risk
    elif category_count >= 3:
        total_score += 20    # moderate compound risk
    elif category_count >= 2:
        total_score += 10    # light compound risk

    # ── Phase 4: Determine suggested risk level ──
    if total_score >= 40:
        suggested_risk = "high_risk"
    elif total_score >= 20:
        suggested_risk = "medium_risk"
    else:
        suggested_risk = "low_risk"

    # ── Phase 5: Confidence boost ──
    # Strong pattern matches should boost overall confidence
    confidence_boost = 0.0
    if total_score >= 80:
        confidence_boost = 0.25
    elif total_score >= 60:
        confidence_boost = 0.20
    elif total_score >= 40:
        confidence_boost = 0.15
    elif total_score >= 20:
        confidence_boost = 0.08

    # Cap score at 100 for normalization
    capped_score = min(100.0, float(total_score))

    return {
        "rule_score": capped_score,
        "suggested_risk": suggested_risk,
        "matched_categories": matched_categories,
        "matched_explanations": matched_explanations,
        "category_count": category_count,
        "confidence_boost": confidence_boost,
    }


# ──────────────────────────────────────────────────────────
# Explanation Generator
# ──────────────────────────────────────────────────────────

def generate_explanation(clause_text: str, risk_level: str) -> str:
    """
    Generates a human-readable explanation for why a clause was classified
    at a certain risk level.

    Now uses the full weighted assessment instead of simple pattern matching.

    Args:
        clause_text: the clause text to analyze
        risk_level:  final risk level ('low_risk', 'medium_risk', 'high_risk')

    Returns:
        Combined explanation string based on matched patterns and combos.
        Falls back to a generic explanation if no patterns match.
    """
    if not clause_text:
        return "No text provided for analysis."

    assessment = assess_clause_risk(clause_text)

    if assessment["matched_explanations"]:
        risk_indicators = ", ".join(assessment["matched_categories"])
        combined = " ".join(assessment["matched_explanations"])
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

    assessment = assess_clause_risk(clause_text)
    return assessment["matched_categories"]
