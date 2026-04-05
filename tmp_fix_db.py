import asyncio
from app.core.database import AsyncSessionLocal
from app.models.proposed_schemes import ProposedScheme
from sqlalchemy import update

async def reset_pending():
    async with AsyncSessionLocal() as db:
        await db.execute(update(ProposedScheme).where(ProposedScheme.status == 'pending').values(status='rejected'))
        await db.commit()
        print("Done resetting pending schemes")

if __name__ == "__main__":
    asyncio.run(reset_pending())
