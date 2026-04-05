from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user_details import UserDetails
import json
import os
from typing import List, Dict


router = APIRouter(prefix="/recomendation", tags=["recomendation"])

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


def get_age_group(age: int) -> str:
    """Map age to age group category"""
    if age < 5:
        return "Child"
    elif 5 <= age < 18:
        return "Youth"
    elif 18 <= age < 60:
        return "Adult"
    else:
        return "Senior"


def matches_criteria(opportunity: Dict, user_details: UserDetails) -> bool:
    """Check if opportunity matches user eligibility criteria"""
    
    # Check Gender
    gender_eligibility = opportunity.get("Gender_Eligibility", "").lower()
    if "women only" in gender_eligibility and user_details.gender.lower() != "female":
        return False
    if "men only" in gender_eligibility and user_details.gender.lower() != "male":
        return False
    
    # Check Education
    education_req = opportunity.get("Education", "").lower()
    user_education = user_details.education.lower()
    if "primary" in education_req and user_education not in ["primary", "secondary", "higher secondary", "bachelor", "master", "phd"]:
        return False
    if "secondary" in education_req and user_education not in ["secondary", "higher secondary", "bachelor", "master", "phd"]:
        return False
    
    # Check State
    state_eligibility = opportunity.get("State", "").lower()
    if "all india" not in state_eligibility and user_details.state.lower() not in state_eligibility.lower():
        return False
    
    # Check Country
    country_eligibility = opportunity.get("Country", "").lower()
    if user_details.country.lower() not in country_eligibility:
        return False
    
    # Check Caste
    caste_eligibility = opportunity.get("Eligible_Caste", "").lower()
    if "all categories" not in caste_eligibility and user_details.caste.lower() not in caste_eligibility.lower():
        return False
    
    # Check Income
    income_eligibility = opportunity.get("Eligible_Income", "").lower()
    if "no income limit" not in income_eligibility:
        if "low income" in income_eligibility and user_details.income > 500000:
            return False
        if "bpl" in income_eligibility and user_details.income > 100000:
            return False
    
    # Check Disability
    disability_eligibility = opportunity.get("Disability_Eligibility", "").lower()
    if "all" not in disability_eligibility and user_details.disability.lower() not in disability_eligibility.lower():
        return False
    
    # Check Age Group
    age_group_eligibility = opportunity.get("Eligible_Agegroup", "").lower()
    user_age_group = get_age_group(user_details.age).lower()
    if "all ages" not in age_group_eligibility and user_age_group not in age_group_eligibility:
        return False
    
    return True


from app.utilities.nlp_search import compute_eligibility_ml_naive_bayes, compute_eligibility_percentage

@router.post("/recomendation")
async def recomendation(
    user_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get personalized recommendations for education and health schemes based on user profile
    """
    
    # Fetch user details from database
    stmt = select(UserDetails).where(UserDetails.user_id == user_id)
    result = await db.execute(stmt)
    user_details = result.scalar_one_or_none()
    
    if not user_details:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    # Load opportunity data from JSON files
    education_opportunities = load_json_data(EDUCATION_DATA_PATH)
    health_opportunities = load_json_data(HEALTH_DATA_PATH)
    
    # Filter recommendations based on user eligibility
    from app.utilities.nlp_search import compute_eligibility_ml_logistic_regression, compute_eligibility_percentage
    
    # Pre-compute eligibility
    education_opportunities = compute_eligibility_ml_logistic_regression(education_opportunities, user_details)
    health_opportunities = compute_eligibility_ml_logistic_regression(health_opportunities, user_details)

    # Sort descending by eligibility percentage (hybrid Logistic Regression + rules score)
    education_opportunities.sort(key=lambda x: x['eligibility_percentage'], reverse=True)
    health_opportunities.sort(key=lambda x: x['eligibility_percentage'], reverse=True)

    # Return all schemes that have at least some matched criteria
    education_recommendations = [opp for opp in education_opportunities if opp['eligibility_percentage'] > 0]
    health_recommendations = [opp for opp in health_opportunities if opp['eligibility_percentage'] > 0]
    
    return {
        "user_id": user_id,
        "user_name": user_details.full_name,
        "user_profile": {
            "age": user_details.age,
            "gender": user_details.gender,
            "education": user_details.education,
            "caste": user_details.caste,
            "income": user_details.income,
            "disability": user_details.disability,
            "state": user_details.state,
            "country": user_details.country
        },
        "education_recommendations": {
            "count": len(education_recommendations),
            "opportunities": education_recommendations
        },
        "health_recommendations": {
            "count": len(health_recommendations),
            "opportunities": health_recommendations
        },
        "total_recommendations": len(education_recommendations) + len(health_recommendations)
    }