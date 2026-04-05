import asyncio
from app.core.database import AsyncSessionLocal
from app.models.proposed_schemes import ProposedScheme
from sqlalchemy import select, update
from app.utilities.ai_agent import process_proposed_scheme

async def fix_pending():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(ProposedScheme).where(ProposedScheme.status == "pending"))
        pending_schemes = result.scalars().all()
        
        for scheme in pending_schemes:
            print(f"Reprocessing stuck scheme: {scheme.scheme_name}")
            # we need to manually call process_proposed_scheme
            await process_proposed_scheme(
                scheme_name=scheme.scheme_name,
                state=scheme.state,
                sector=scheme.sector,
                category=scheme.category
            )
        print("Done reprocessing.")

if __name__ == "__main__":
    asyncio.run(fix_pending())
