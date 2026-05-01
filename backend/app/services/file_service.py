"""
File Service
------------
Handles saving uploaded files to the local filesystem.
Generates unique filenames to prevent collisions.
"""

import os
import uuid
from fastapi import UploadFile, HTTPException

# Directory where uploaded files are stored (relative to backend root)
UPLOAD_DIR = "uploads"

# Ensure the uploads directory exists at import time
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".png", ".jpg", ".jpeg"}


def get_file_extension(filename: str) -> str:
    """
    Extracts the lowercase file extension from a filename.
    Example: 'contract.PDF' → '.pdf'
    """
    _, ext = os.path.splitext(filename)
    return ext.lower()


async def save_file(file: UploadFile) -> dict:
    """
    Saves an uploaded file to the uploads directory with a unique UUID-based name.

    Steps:
        1. Validate file extension against allowed types
        2. Generate a UUID-based filename to prevent collisions
        3. Write the file content to disk

    Args:
        file: FastAPI UploadFile object from the request

    Returns:
        dict with keys:
            - file_name: the original filename from the upload
            - file_path: the path where the file was saved on disk
            - file_ext:  the lowercase file extension (e.g. '.pdf')

    Raises:
        HTTPException 400: if the file extension is not in ALLOWED_EXTENSIONS
    """
    # Extract and validate extension
    file_ext = get_file_extension(file.filename)

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: '{file_ext}'. "
                   f"Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Generate a collision-safe filename
    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Normalize path separators for cross-platform consistency
    file_path = file_path.replace("\\", "/")

    # Write file to disk
    try:
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    return {
        "file_name": file.filename,       # original name from upload
        "file_path": file_path,            # path on disk
        "file_ext": file_ext               # normalized extension
    }