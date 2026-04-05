from app.core.database import get_db
from app.models.comments import Comment as comment_model
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("/comment")
async def comment(
    comment: str,
    title : str,
    user_id : str,
    db: AsyncSession = Depends(get_db),
) :
    comment = comment_model(
        user_id = user_id,
        comment = comment,
        title = title,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


