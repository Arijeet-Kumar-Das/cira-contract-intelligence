"""
Dependency Injection Utilities
------------------------------
Provides reusable dependencies for FastAPI route handlers.
"""

from app.db.session import SessionLocal


def get_db():
    """
    Yields a database session for the duration of a request.
    Automatically closes the session when the request is complete,
    even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()