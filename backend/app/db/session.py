"""
Database Session Management
---------------------------
Creates the SQLite engine and session factory.
The session factory (SessionLocal) is used by dependency injection in routes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite connection string — stores DB file in the backend root directory
DATABASE_URL = "sqlite:///./cira.db"

# Create the database engine
# check_same_thread=False is required for SQLite with FastAPI (multi-threaded)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory — each request gets its own session via dependency injection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)