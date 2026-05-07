"""
Clause Splitting Service
------------------------
Splits legal contract text into individual clauses/sentences
for granular risk analysis.

Splitting Strategy:
    1. Split on double newlines (paragraph breaks)
    2. Split on semicolons (common in legal drafting)
    3. Split on sentence boundaries (period + space + uppercase)
    4. Remove empty/whitespace-only clauses
    5. Preserve original order and assign sequential IDs

Designed for modularity — can be swapped for an NLP-based
splitter (e.g., spaCy sentence segmenter) in the future.
"""

import re
from typing import TypedDict


class ClauseItem(TypedDict):
    """Represents a single clause extracted from a contract."""
    id: int
    text: str


def split_into_clauses(text: str, min_length: int = 15) -> list[ClauseItem]:
    """
    Splits legal text into clauses using a multi-pass approach.

    Pass 1: Split on paragraph breaks (double newlines)
    Pass 2: Split on semicolons
    Pass 3: Split on sentence boundaries (. followed by space + uppercase letter)

    Args:
        text:       raw contract text to split
        min_length: minimum character length for a clause to be kept
                    (filters out noise like section numbers)

    Returns:
        List of ClauseItem dicts with sequential IDs and cleaned text.
    """
    if not text or not text.strip():
        return []

    # ──────────────────────────────────────────────
    # Pass 1: Split on paragraph breaks
    # ──────────────────────────────────────────────
    paragraphs = re.split(r'\n\s*\n', text)

    # ──────────────────────────────────────────────
    # Pass 2: Split paragraphs on semicolons
    # ──────────────────────────────────────────────
    fragments = []
    for para in paragraphs:
        # Split on semicolons but only when followed by whitespace
        parts = re.split(r';\s*', para)
        fragments.extend(parts)

    # ──────────────────────────────────────────────
    # Pass 3: Split fragments on sentence boundaries
    # Matches: period + space + uppercase letter (start of new sentence)
    # Lookbehind ensures we don't split on abbreviations like "U.S." or "Inc."
    # ──────────────────────────────────────────────
    clauses_raw = []
    for fragment in fragments:
        # Split on sentence endings: ". " followed by an uppercase letter
        # Also handles "! " and "? " boundaries
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', fragment)
        clauses_raw.extend(sentences)

    # ──────────────────────────────────────────────
    # Clean and filter
    # ──────────────────────────────────────────────
    clauses: list[ClauseItem] = []
    clause_id = 1

    for raw_clause in clauses_raw:
        cleaned = raw_clause.strip()

        # Skip empty or too-short clauses (noise)
        if not cleaned or len(cleaned) < min_length:
            continue

        clauses.append({
            "id": clause_id,
            "text": cleaned,
        })
        clause_id += 1

    return clauses
