"""
Contract ORM Model
------------------
Represents a legal document that has been uploaded, analyzed,
and scored for risk. Maps to the 'contracts' table in SQLite.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from app.db.base import Base


class Contract(Base):
    """
    Stores metadata and analysis results for each uploaded contract.

    Columns:
        id          - Auto-incrementing primary key
        file_name   - Original (or UUID-renamed) filename
        file_path   - Relative path to the saved file on disk
        extracted_text - Raw text extracted from the document (optional, can be large)
        risk_score  - Predicted risk label (low_risk / medium_risk / high_risk)
        created_at  - Timestamp of when the record was created (UTC)
    """
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)  # optional — store extracted text for auditing
    risk_score = Column(String(50), nullable=False, default="unknown")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))