from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.user_details import UserDetails as user_details_schema
from app.models.user_details import UserDetails as user_details_model
from sqlalchemy import select
from app.models.users import User

router = APIRouter(prefix="/user-details", tags=["user-details"])

@router.post("/user_data")
async def user_data(
    user_data: user_details_schema,
    db: AsyncSession = Depends(get_db),
) :
    user_id = user_data.user_id
    user_name = user_data.user_name
    user_email = user_data.email
    user_phone = user_data.phone
    user_address = user_data.address
    user_city = user_data.city
    user_state = user_data.state
    user_zip_code = user_data.zip_code
    user_country = user_data.country
    user_gender = user_data.gender
    user_age = user_data.age
    user_education = user_data.education
    user_caste = user_data.caste
    user_income = user_data.income
    user_disability = user_data.disability
    
    user = user_details_model(
        user_id = user_id,
        full_name = user_name,
        email = user_email,
        phone = user_phone,
        address = user_address,
        city = user_city,
        state = user_state,
        zip_code = user_zip_code,
        country = user_country,
        gender = user_gender,
        age = user_age,
        education = user_education,
        caste = user_caste,
        income = user_income,
        disability = user_disability,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


@router.get("/user_details")
async def get_user_details(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(user_details_model))
    users = result.scalars().all()
    return users



@router.put('/update_user_details')
async def update_user_details(
    user_id: str,
    user_data: user_details_schema,
    db: AsyncSession = Depends(get_db),
) :
    user = await db.execute(select(user_details_model).where(user_details_model.user_id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    user.user_name = user_data.user_name
    user.email = user_data.email
    user.phone = user_data.phone
    user.address = user_data.address
    user.city = user_data.city
    user.state = user_data.state
    user.zip_code = user_data.zip_code
    user.country = user_data.country
    user.gender = user_data.gender
    user.age = user_data.age
    user.education = user_data.education
    user.caste = user_data.caste
    user.income = user_data.income
    user.disability = user_data.disability
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

