"""
OCR Service
-----------
Handles Optical Character Recognition for images and scanned PDFs.
Uses Tesseract OCR via the pytesseract wrapper.
"""

import pytesseract
from PIL import Image


def extract_text_from_image(image_path: str) -> str:
    """
    Extracts text from an image file using Tesseract OCR.

    Args:
        image_path: absolute or relative path to an image file (.jpg, .png, .jpeg)

    Returns:
        Extracted text as a string, or empty string if OCR fails.
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"[OCR ERROR] Failed to extract text from image '{image_path}': {e}")
        return ""


def extract_text_from_pil_image(pil_image: Image.Image) -> str:
    """
    Extracts text from an in-memory PIL Image object using Tesseract OCR.
    Used for PDF pages that have been converted to images.

    Args:
        pil_image: a PIL Image object (e.g., from pdf2image or PyMuPDF)

    Returns:
        Extracted text as a string, or empty string if OCR fails.
    """
    try:
        text = pytesseract.image_to_string(pil_image)
        return text.strip()
    except Exception as e:
        print(f"[OCR ERROR] Failed to extract text from PIL image: {e}")
        return ""
