"""
Database Base Configuration
---------------------------
Provides the declarative base class used by all SQLAlchemy models.
All ORM models inherit from this Base to register with the metadata.
"""

from sqlalchemy.orm import declarative_base

# Declarative base — every model class must inherit from this
Base = declarative_base()