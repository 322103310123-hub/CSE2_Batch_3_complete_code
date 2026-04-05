from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class ProposedScheme(Base):
    __tablename__ = "proposed_schemes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    sector = Column(String, nullable=False) # 'Government' or 'Private'
    category = Column(String, nullable=False) # 'Education' or 'Health'
    status = Column(String, default="pending") # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
