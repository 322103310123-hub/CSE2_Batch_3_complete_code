from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import os
load_dotenv()



DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

# ✅ Base class for models
Base = declarative_base()


# ✅ Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()


# ✅ Function to auto-create tables
async def init_models():
    # Import models here to ensure they are registered with Base before create_all
    from app.models import scheme_count, users, user_details, comments, liked_schemes, proposed_schemes
    """Create all database tables asynchronously."""
    async with engine.begin() as conn:
        # Optional: test connection
        # await conn.execute(text("SELECT 1"))
        # Automatically create all tables
        await conn.run_sync(Base.metadata.create_all)


