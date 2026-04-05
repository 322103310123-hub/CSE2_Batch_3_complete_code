from app.core.database import get_db
from app.models.scheme_count import SchemeCount
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException
import json
import os
from typing import List, Dict
from app.models.comments import Comment
from fastapi.encoders import jsonable_encoder
from app.models.users import User
from app.models.liked_schemes import LikedScheme
from app.models.user_details import UserDetails
from app.utilities.nlp_search import search_schemes_nlp, compute_eligibility_percentage, analyze_eligibility
from typing import Optional
from fastapi import BackgroundTasks
from app.schemas.proposed_schemes import ProposedSchemeCreate
from app.models.proposed_schemes import ProposedScheme
from app.utilities.ai_agent import process_proposed_scheme

router = APIRouter(prefix="/schemes", tags=["schemes"])

# Load data files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EDUCATION_DATA_PATH = os.path.join(BASE_DIR, "data", "education_datset1.json")
HEALTH_DATA_PATH = os.path.join(BASE_DIR, "data", "health_dataset.json")


def load_json_data(file_path: str) -> List[Dict]:
    """Load JSON data from file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@router.get("/schemes")
async def get_schemes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SchemeCount))
    schemes = result.scalars().all()
    return schemes



@router.get("/all_schemes_data")
async def get_all_schemes_data() -> Dict:
    """Return all schemes from both datasets for frontend searching/autocomplete."""
    education = load_json_data(EDUCATION_DATA_PATH)
    health = load_json_data(HEALTH_DATA_PATH)
    return {
        "education": education,
        "health": health
    }

@router.post('/update_scheme_count')
async def update_scheme_count(
    scheme_title: str,
    db: AsyncSession = Depends(get_db),
) :
    scheme = await db.execute(select(SchemeCount).where(SchemeCount.scheme_title == scheme_title))
    scheme = scheme.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with title '{scheme_title}' not found")
    count = scheme.count + 1
    
    scheme = SchemeCount(
        scheme_title = scheme_title,
        count = count,
    )
    db.add(scheme)
    await db.commit()
    await db.refresh(scheme)
    return scheme


@router.post('/get_scheme_by_title')
async def get_scheme_by_title(
    title: str,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """
    Get scheme details from datasets by title (partial or exact match), optionally tracking match details.
    """
    
    # Load opportunity data from JSON files
    education_opportunities = load_json_data(EDUCATION_DATA_PATH)
    health_opportunities = load_json_data(HEALTH_DATA_PATH)
    
    # Search by title in both datasets
    title_lower = title.lower()
    
    education_results = [
        opp.copy() for opp in education_opportunities
        if title_lower in opp.get("Title", "").lower()
    ]
    
    health_results = [
        opp.copy() for opp in health_opportunities
        if title_lower in opp.get("Title", "").lower()
    ]
    
    if not education_results and not health_results:
        raise HTTPException(
            status_code=404,
            detail=f"No schemes found with title containing '{title}'"
        )

    # Optional detailed eligibility
    if user_id and user_id != 'null':
        user_details = await db.execute(select(UserDetails).where(UserDetails.user_id == user_id))
        user_details = user_details.scalar_one_or_none()
        if user_details:
            for opp in education_results:
                opp['eligibility_details'] = analyze_eligibility(opp, user_details)
            for opp in health_results:
                opp['eligibility_details'] = analyze_eligibility(opp, user_details)

    comments = await db.execute(select(Comment).where(Comment.title == title))
    comments = comments.scalars().all()
    comments = jsonable_encoder(comments)
    for comment in comments:
        user_name = await db.execute(select(User.full_name).where(User.id == comment['user_id']))
        comment['user_name'] = user_name.scalar_one_or_none()
    
    return {
        "search_query": title,
        "education_schemes": {
            "count": len(education_results),
            "schemes": education_results
        },
        "health_schemes": {
            "count": len(health_results),
            "schemes": health_results
        },
        "total_results": len(education_results) + len(health_results),
        "comments": comments
    }


@router.post('/search_schemes')
async def search_schemes(
    query: str,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """
    Search schemes using NLP and return similarity and eligibility score.
    """
    education_opportunities = load_json_data(EDUCATION_DATA_PATH)
    health_opportunities = load_json_data(HEALTH_DATA_PATH)
    all_schemes = education_opportunities + health_opportunities

    results = search_schemes_nlp(query, all_schemes, top_k=20)
    
    if user_id and user_id != 'null':
        user_details = await db.execute(select(UserDetails).where(UserDetails.user_id == user_id))
        user_details = user_details.scalar_one_or_none()
        if user_details:
            for r in results:
                r['eligibility_percentage'] = compute_eligibility_percentage(r, user_details)

    return {
        "search_query": query,
        "count": len(results),
        "schemes": results
    }


@router.post('/like_scheme')
async def like_scheme(
    user_id: str,
    scheme_title: str,
    db: AsyncSession = Depends(get_db),
) :
    liked_scheme = LikedScheme(
        user_id = user_id,
        scheme_title = scheme_title,
    )
    db.add(liked_scheme)
    await db.commit()
    await db.refresh(liked_scheme)
    return liked_scheme


@router.get('/get_liked_schemes')
async def get_liked_schemes(
    user_id: str,
    db: AsyncSession = Depends(get_db),
) :
    liked_schemes = await db.execute(select(LikedScheme).where(LikedScheme.user_id == user_id))
    liked_schemes = liked_schemes.scalars().all()
    return liked_schemes


@router.post('/unlike_scheme')
async def unlike_scheme(
    user_id: str,
    scheme_title: str,
    db: AsyncSession = Depends(get_db),
) :
    liked_scheme = await db.execute(select(LikedScheme).where(LikedScheme.user_id == user_id and LikedScheme.scheme_title == scheme_title))
    liked_scheme = liked_scheme.scalars().first()
    if not liked_scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with title '{scheme_title}' not found")
    await db.delete(liked_scheme)
    await db.commit()
    return liked_scheme

@router.post('/propose_scheme')
async def propose_scheme(
    scheme_data: ProposedSchemeCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Accepts user submission for a new scheme, saves it to database, 
    and triggers the AI agent in the background to verify and update the JSON dataset.
    """
    # 1. Save to database
    new_proposed_scheme = ProposedScheme(
        scheme_name=scheme_data.scheme_name,
        state=scheme_data.state,
        sector=scheme_data.sector,
        category=scheme_data.category,
        status="pending"
    )
    db.add(new_proposed_scheme)
    await db.commit()
    await db.refresh(new_proposed_scheme)
    
    # 2. Start Background Task for AI Agent Web Search & Verification
    background_tasks.add_task(
        process_proposed_scheme,
        scheme_name=scheme_data.scheme_name,
        state=scheme_data.state,
        sector=scheme_data.sector,
        category=scheme_data.category
    )
    
    return {
        "message": f"Scheme '{scheme_data.scheme_name}' has been submitted successfully for AI verification.",
        "status": "pending",
        "scheme_id": new_proposed_scheme.id
    }

@router.get('/get_proposed_schemes')
async def get_proposed_schemes(db: AsyncSession = Depends(get_db)):
    """Fetch the status of all proposed schemes."""
    result = await db.execute(select(ProposedScheme).order_by(ProposedScheme.created_at.desc()))
    schemes = result.scalars().all()
    return schemes
