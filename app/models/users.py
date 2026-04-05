from app.core.database import Base
from sqlalchemy import Column, String

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    details = Column(String)