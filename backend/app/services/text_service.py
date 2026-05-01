"""
Text Extraction Service
-----------------------
Central service that extracts text from any supported file type.
Orchestrates the correct extraction strategy based on file extension:
    .txt          → read file directly
    .pdf          → try PyMuPDF first, fallback to OCR if empty
    .jpg/.png     → use OCR directly
"""

import fitz  # PyMuPDF
from PIL import Image

from app.services.ocr_service import extract_text_from_image, extract_text_from_pil_image


def extract_text_from_txt(file_path: str) -> str:
    """
    Reads plain text from a .txt file.

    Args:
        file_path: path to the .txt file

    Returns:
        File content as a string, or empty string on failure.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        print(f"[TEXT ERROR] Failed to read .txt file '{file_path}': {e}")
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file using PyMuPDF.

    Strategy:
        1. Try extracting embedded text from each page using PyMuPDF
        2. If the result is empty (scanned PDF), fallback to OCR:
           - Render each page as an image
           - Run Tesseract OCR on each rendered image
           - Concatenate all page texts

    Args:
        file_path: path to the .pdf file

    Returns:
        Extracted text as a string, or empty string if all methods fail.
    """
    try:
        doc = fitz.open(file_path)
        text = ""

        # Step 1: Try native text extraction from each page
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"

        doc.close()

        # If we got text, return it
        if text.strip():
            print(f"[PDF] Extracted text from '{file_path}' using PyMuPDF (native)")
            return text.strip()

        # Step 2: Fallback — PDF is likely scanned, use OCR
        print(f"[PDF] No native text found in '{file_path}', falling back to OCR...")
        return _ocr_pdf_pages(file_path)

    except Exception as e:
        print(f"[PDF ERROR] Failed to process PDF '{file_path}': {e}")
        return ""


def _ocr_pdf_pages(file_path: str) -> str:
    """
    Internal helper: converts each PDF page to an image and runs OCR.
    Uses PyMuPDF's built-in rendering (no external poppler dependency).

    Args:
        file_path: path to the .pdf file

    Returns:
        Concatenated OCR text from all pages.
    """
    try:
        doc = fitz.open(file_path)
        all_text = []

        for page_num, page in enumerate(doc):
            # Render page to a high-DPI pixmap for better OCR accuracy
            # zoom=2 gives ~144 DPI (default is 72 DPI)
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat)

            # Convert pixmap to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Run OCR on the rendered image
            page_text = extract_text_from_pil_image(img)
            if page_text:
                all_text.append(page_text)

            print(f"[OCR] Page {page_num + 1}: extracted {len(page_text)} chars")

        doc.close()
        return "\n".join(all_text).strip()

    except Exception as e:
        print(f"[OCR ERROR] Failed to OCR PDF pages for '{file_path}': {e}")
        return ""


def extract_text(file_path: str, file_ext: str) -> str:
    """
    Main entry point: extracts text from any supported file type.

    This function is called by the route handler after a file is saved.
    It delegates to the appropriate extraction function based on file extension.

    Args:
        file_path: path to the saved file on disk
        file_ext:  lowercase file extension (e.g. '.pdf', '.txt', '.jpg')

    Returns:
        Extracted text as a string. Returns empty string if extraction fails.
    """
    if file_ext == ".txt":
        return extract_text_from_txt(file_path)

    elif file_ext == ".pdf":
        return extract_text_from_pdf(file_path)

    elif file_ext in (".jpg", ".jpeg", ".png"):
        return extract_text_from_image(file_path)

    else:
        print(f"[TEXT] Unsupported file extension: {file_ext}")
        return ""