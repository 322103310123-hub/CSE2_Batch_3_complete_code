from app.core.database import Base
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid


class UserDetails(Base):
    __tablename__ = "user_details"
    user_id = Column(String, nullable=False, primary_key=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    education = Column(String, nullable=False)
    caste = Column(String, nullable=False)
    income = Column(Integer, nullable=False)
    disability = Column(String, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    