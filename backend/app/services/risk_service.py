"""
Risk Prediction Service
-----------------------
Loads the pre-trained ML model and TF-IDF vectorizer from disk,
then exposes a prediction function for contract risk classification.

Expected model output labels: 'low_risk', 'medium_risk', 'high_risk'
"""

import os
import joblib

# ──────────────────────────────────────────────────────────
# Load model and vectorizer at module import time (singleton)
# This avoids reloading from disk on every request.
# ──────────────────────────────────────────────────────────

# Resolve paths relative to this file's location (app/services/)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODEL_PATH = os.path.join(_BASE_DIR, "ml", "risk_model.pkl")
_VECTORIZER_PATH = os.path.join(_BASE_DIR, "ml", "vectorizer.pkl")

# Validate that model files exist before loading
if not os.path.exists(_MODEL_PATH):
    raise FileNotFoundError(
        f"Risk model not found at '{_MODEL_PATH}'. "
        "Please ensure 'risk_model.pkl' is placed in the app/ml/ directory."
    )

if not os.path.exists(_VECTORIZER_PATH):
    raise FileNotFoundError(
        f"Vectorizer not found at '{_VECTORIZER_PATH}'. "
        "Please ensure 'vectorizer.pkl' is placed in the app/ml/ directory."
    )

# Load once at startup
print("[ML] Loading risk model and vectorizer...")
model = joblib.load(_MODEL_PATH)
vectorizer = joblib.load(_VECTORIZER_PATH)
print("[ML] Model and vectorizer loaded successfully.")


def predict_risk(text: str) -> str:
    """
    Predicts the risk level of a contract from its extracted text.

    Steps:
        1. Transform the input text using the TF-IDF vectorizer
        2. Feed the transformed vector into the trained classifier
        3. Return the predicted label

    Args:
        text: raw extracted text from the contract document

    Returns:
        Risk label string: 'low_risk', 'medium_risk', or 'high_risk'

    Raises:
        ValueError: if the input text is empty or None
    """
    if not text or not text.strip():
        raise ValueError("Cannot predict risk on empty text.")

    # Transform text → TF-IDF feature vector
    features = vectorizer.transform([text])

    # Predict using the trained model
    prediction = model.predict(features)[0]

    return prediction