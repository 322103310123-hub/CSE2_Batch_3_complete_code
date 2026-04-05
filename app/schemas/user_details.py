from pydantic import BaseModel

class UserDetails(BaseModel):
    user_id: str
    user_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    gender: str
    age: int
    education: str
    caste: str
    income: int
    disability: str