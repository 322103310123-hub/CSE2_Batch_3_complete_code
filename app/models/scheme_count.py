from app.core.database import Base
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid


class SchemeCount(Base):
    __tablename__ = "scheme_count"
    scheme_title = Column(String, nullable=False, primary_key=True)
    count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())